export default function GameHUD() {
  return (
    <>
      {/* BRAND */}

      <div className="brand">
        <span>LIFE</span>
        <strong>RPG</strong>
      </div>

      {/* TOP PLAYER STATUS */}

      <div className="player-status">

        <div className="level">
          <small>LEVEL</small>
          <strong>01</strong>
        </div>

        <div className="xp-section">
          <div className="xp-header">
            <span>XP</span>
            <span>0 / 100</span>
          </div>

          <div className="xp-bar">
            <span />
          </div>
        </div>

        <div className="coins">
          <span>◉</span>
          0
        </div>

      </div>

      {/* QUEST */}

      <div className="quest-panel">

        <div className="quest-label">
          ◆ MAIN QUEST
        </div>

        <h1>
          YOUR JOURNEY
        </h1>

        <p>
          Complete your objectives
          to progress through the world.
        </p>

        <div className="quest-objective">
          <span>OBJECTIVE</span>

          <strong>
            Awaiting mission
          </strong>
        </div>

      </div>

      {/* HEALTH */}

      <div className="player-bars">

        <div className="bar-row">

          <span className="heart">
            ♥
          </span>

          <div className="bar">
            <span className="health-fill" />
          </div>

          <strong>
            100 / 100
          </strong>

        </div>

        <div className="bar-row">

          <span className="energy">
            ◆
          </span>

          <div className="bar">
            <span className="stamina-fill" />
          </div>

          <strong>
            100 / 100
          </strong>

        </div>

      </div>

      {/* CONTROLS */}

      <div className="controls">

        <div>
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd>
          <span>MOVE</span>
        </div>

        <div>
          <kbd>SHIFT</kbd>
          <span>RUN</span>
        </div>

        <div>
          <kbd>SPACE</kbd>
          <span>JUMP</span>
        </div>

        <div>
          <kbd>C</kbd>
          <span>CROUCH</span>
        </div>

        <div>
          <kbd>E</kbd>
          <span>INTERACT</span>
        </div>

      </div>

      {/* BOTTOM */}

      <div className="bottom-ui">

        <span>
          THE WORLD AWAITS
        </span>

        <div>
          <kbd>I</kbd>
          INVENTORY
        </div>

        <div>
          <kbd>M</kbd>
          MAP
        </div>

        <div>
          <kbd>L</kbd>
          QUESTS
        </div>

      </div>

      {/* MINIMAP */}

      <div className="minimap">

        <div className="north">
          N
        </div>

        <div className="player-arrow">
          ▲
        </div>

        <div className="map-marker">
          ◆
        </div>

      </div>
    </>
  );
}