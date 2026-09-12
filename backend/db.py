import os
import json
import uuid
import certifi
from bson import ObjectId
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
LOCAL_DB_FILE = os.path.join(os.path.dirname(__file__), "local_db.json")


class InsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class UpdateResult:
    def __init__(self, matched_count=1, modified_count=1):
        self.matched_count = matched_count
        self.modified_count = modified_count


class DeleteResult:
    def __init__(self, deleted_count=1):
        self.deleted_count = deleted_count


def _load_local_data():
    if not os.path.exists(LOCAL_DB_FILE):
        return {"users": [], "tasks": []}
    try:
        with open(LOCAL_DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"users": [], "tasks": []}


def _save_local_data(data):
    try:
        with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
    except Exception as err:
        print(f"Failed to persist local_db.json: {err}")


def _match_filter(doc, query):
    if not query:
        return True
    for k, v in query.items():
        if k in ("_id", "user_id"):
            # Compare both string and ObjectId
            doc_id = str(doc.get(k, ""))
            query_id = str(v)
            if doc_id != query_id:
                return False
        elif doc.get(k) != v:
            return False
    return True


class LocalCollection:
    def __init__(self, name):
        self.name = name

    def find_one(self, query=None):
        data = _load_local_data()
        items = data.get(self.name, [])
        for item in items:
            if _match_filter(item, query):
                # Ensure _id is ObjectId-compatible
                res = dict(item)
                if "_id" in res and not isinstance(res["_id"], ObjectId):
                    try:
                        res["_id"] = ObjectId(str(res["_id"]))
                    except Exception:
                        pass
                return res
        return None

    def find(self, query=None):
        data = _load_local_data()
        items = data.get(self.name, [])
        results = []
        for item in items:
            if _match_filter(item, query):
                res = dict(item)
                if "_id" in res and not isinstance(res["_id"], ObjectId):
                    try:
                        res["_id"] = ObjectId(str(res["_id"]))
                    except Exception:
                        pass
                results.append(res)
        return results

    def insert_one(self, doc):
        data = _load_local_data()
        items = data.setdefault(self.name, [])
        new_doc = dict(doc)
        if "_id" not in new_doc:
            new_id = ObjectId()
            new_doc["_id"] = new_id
        else:
            new_id = new_doc["_id"]

        # Store as string for JSON serialization
        store_doc = dict(new_doc)
        store_doc["_id"] = str(new_id)
        items.append(store_doc)
        _save_local_data(data)
        return InsertResult(new_id)

    def update_one(self, query, update):
        data = _load_local_data()
        items = data.get(self.name, [])
        matched = 0
        modified = 0

        for i, item in enumerate(items):
            if _match_filter(item, query):
                matched = 1
                # Apply $set or direct fields
                if "$set" in update:
                    for k, v in update["$set"].items():
                        # Handle dot notation like "attributes.health"
                        if "." in k:
                            parts = k.split(".")
                            curr = item
                            for part in parts[:-1]:
                                curr = curr.setdefault(part, {})
                            curr[parts[-1]] = v
                        else:
                            item[k] = v
                else:
                    for k, v in update.items():
                        if not k.startswith("$"):
                            item[k] = v

                # Handle $inc if any
                if "$inc" in update:
                    for k, v in update["$inc"].items():
                        if "." in k:
                            parts = k.split(".")
                            curr = item
                            for part in parts[:-1]:
                                curr = curr.setdefault(part, {})
                            curr[parts[-1]] = curr.get(parts[-1], 0) + v
                        else:
                            item[k] = item.get(k, 0) + v

                modified = 1
                items[i] = item
                break

        if modified:
            _save_local_data(data)
        return UpdateResult(matched, modified)

    def delete_one(self, query):
        data = _load_local_data()
        items = data.get(self.name, [])
        deleted = 0
        new_items = []
        for item in items:
            if not deleted and _match_filter(item, query):
                deleted = 1
                continue
            new_items.append(item)

        data[self.name] = new_items
        if deleted:
            _save_local_data(data)
        return DeleteResult(deleted)


class SmartCollection:
    def __init__(self, name):
        self.name = name
        self.local = LocalCollection(name)
        self._real = None

    def _get_real_collection(self):
        global _mongo_client, _mongo_available
        if _mongo_available and _mongo_client:
            try:
                db = _mongo_client["evolve_db"]
                return db[self.name]
            except Exception:
                return None
        return None

    def find_one(self, query=None):
        real = self._get_real_collection()
        if real is not None:
            try:
                return real.find_one(query)
            except Exception as e:
                print(f"[SmartDB] Atlas error on find_one: {e}. Falling back to local storage.")
        return self.local.find_one(query)

    def find(self, query=None):
        real = self._get_real_collection()
        if real is not None:
            try:
                return list(real.find(query))
            except Exception as e:
                print(f"[SmartDB] Atlas error on find: {e}. Falling back to local storage.")
        return self.local.find(query)

    def insert_one(self, doc):
        real = self._get_real_collection()
        if real is not None:
            try:
                return real.insert_one(doc)
            except Exception as e:
                print(f"[SmartDB] Atlas error on insert_one: {e}. Falling back to local storage.")
        return self.local.insert_one(doc)

    def update_one(self, query, update):
        real = self._get_real_collection()
        if real is not None:
            try:
                return real.update_one(query, update)
            except Exception as e:
                print(f"[SmartDB] Atlas error on update_one: {e}. Falling back to local storage.")
        return self.local.update_one(query, update)

    def delete_one(self, query):
        real = self._get_real_collection()
        if real is not None:
            try:
                return real.delete_one(query)
            except Exception as e:
                print(f"[SmartDB] Atlas error on delete_one: {e}. Falling back to local storage.")
        return self.local.delete_one(query)


# Initialize MongoDB Atlas Client with certifi & 3s timeout
_mongo_client = None
_mongo_available = False

try:
    if MONGODB_URL:
        _mongo_client = MongoClient(
            MONGODB_URL,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=1000,
            connectTimeoutMS=1000
        )
        _mongo_client.admin.command('ping')
        _mongo_available = True
        print("[SmartDB] Connected to MongoDB Atlas successfully!")
except Exception as exc:
    print(f"[SmartDB] MongoDB Atlas connection skipped: {exc}")
    print("[SmartDB] Using resilient local storage fallback.")
    _mongo_available = False

users_collection = SmartCollection("users")
tasks_collection = SmartCollection("tasks")
