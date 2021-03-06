export default class Player {
  constructor(gameRows, gameColumns, gridSize) {
    // grid size
    this.gridSize = gridSize;
    // game size
    this.gameRows = gameRows;
    this.gameColumns = gameColumns;
    // player size
    this.height = this.gridSize;
    this.width = this.gridSize;
    // player position
    this.position = {
      x: this.gridSize,
      y: this.gridSize * this.gameRows - this.height - 3 * this.gridSize,
    };
    // old player position
    this.oldPosition = {
      x: this.position.x,
      y: this.position.y,
    };
    // player velocity
    this.vel = {
      x: 0,
      y: 0,
    };
    // player direction (this is used for animation)
    this.x_direction = 1 // 1 => right, -1 => left
    // ground speed (horizontal speed while on ground)
    this.groundSpeed = 0.1 * this.gridSize;
    // air speed (horizontal speed while jumping)
    this.airSpeed = 0.1 * this.gridSize; // do not change
    // jump speed (vertical speed while jumping)
    this.jumpSpeed = 0.4 * this.gridSize; // do not change
    // jumping?
    this.isJumping = false;
    // ground friction (horizontal friction while on ground)
    this.groundFriction = 1 - this.groundSpeed / (this.gridSize * 1.242857);
    // gravity
    this.gravity = 0.023333 * this.gridSize; // do not change
    // target x-position of jump
    this.jumpDestance = null;
    // target x-position of move
    this.moveDistance = null;
    // x-position offset (this is just to fix rouding errors)
    this.offSet = 0.0005 * this.gridSize; // do not change
    // velocity threshold
    this.thresh = 0.00033333 * this.gridSize;
  }

  update(deltaTime) {
    if (!deltaTime) return

    this._updatePosition()
    this._limitJumpDistance()
    this._limitMoveDistance()
    this._applyFriction()
    this._applyGravity()
  }

  async moveRight() {
    if (!this.isJumping && Math.abs(this.vel.x) < this.thresh && Math.abs(this.vel.y) < this.thresh) {
      this.moveDistance = this.position.x + this.gridSize;
      this.vel.x = this.groundSpeed;
      this.x_direction = 1;
      await this._wait(50)
    } else {
      await this._wait(50)
      await this.moveRight()
    }
  }

  async moveLeft() {
    if (!this.isJumping && Math.abs(this.vel.x) < this.thresh && Math.abs(this.vel.y) < this.thresh) {
      this.moveDistance = this.position.x - this.gridSize;
      this.vel.x = -this.groundSpeed;
      this.x_direction = -1;
      await this._wait(50)
    } else {
      await this._wait(50)
      await this.moveLeft()
    }
  }

  async jumpRight() {
    if (!this.isJumping && Math.abs(this.vel.x) < this.thresh && Math.abs(this.vel.y) < this.thresh) {
      this.isJumping = true;
      this.jumpDistance = this.position.x + this.gridSize * 3;
      this.vel.y = - this.jumpSpeed;
      this.vel.x = this.airSpeed;
      this.x_direction = 1;
      await this._wait(50)
    } else {
      await this._wait(50)
      await this.jumpRight()
    }
  }

  async jumpLeft() {
    if (!this.isJumping && Math.abs(this.vel.x) < this.thresh && Math.abs(this.vel.y) < this.thresh) {
      this.isJumping = true;
      this.jumpDistance = this.position.x - this.gridSize * 3;
      this.vel.y = - this.jumpSpeed;
      this.vel.x = - this.airSpeed;
      this.x_direction = -1;
      await this._wait(50)
    } else {
      await this._wait(50)
      await this.jumpLeft()
    }
  }

  async start(inputArray) {
    for (let i = 0; i < inputArray.length; i++) {
      await this._stringToFunction(inputArray[i]);
    }
  }

  resetPosition() {
    this.x_direction = 1;
    this.position = {
      x: this.gridSize,
      y: this.gridSize * this.gameRows - this.height - 4 * this.gridSize,
    };
  }

  async _stringToFunction(input) {
    // eslint-disable-next-line default-case
    switch (input) {
      case "hero.moveRight()":
        await this.moveRight();
        break;
      case "hero.moveLeft()":
        await this.moveLeft();
        break;
      case "hero.jumpRight()":
        await this.jumpRight();
        break;
      case "hero.jumpLeft()":
        await this.jumpLeft();
        break;
    }
  }

  _wait(ms) {
    return new Promise(
      resolve => setTimeout(resolve, ms)
    );
  }

  _updatePosition() {
    this.oldPosition.x = this.position.x;
    this.oldPosition.y = this.position.y;
    this.position.x += this.vel.x;
    this.position.y += this.vel.y;
  }

  _applyFriction() {
    if (!this.isJumping) {
      this.vel.x *= this.groundFriction;
    }
  }

  _applyGravity() {
    this.vel.y += this.gravity;
  }

  _limitJumpDistance() {
    if (this.isJumping) {
      if (this.position.x > this.oldPosition.x && this.position.x >= this.jumpDistance) {
        this.position.x = this.jumpDistance;
        this.vel.x = 0;
      }
      if (this.position.x < this.oldPosition.x && this.position.x <= this.jumpDistance) {
        this.position.x = this.jumpDistance;
        this.vel.x = 0;
      }
    }
  }

  _limitMoveDistance() {
    if (!this.isJumping) {
      if (this.position.x > this.oldPosition.x && this.position.x >= this.moveDistance) {
        this.position.x = this.moveDistance;
        this.vel.x = 0;
      }
      if (this.position.x < this.oldPosition.x && this.position.x <= this.moveDistance) {
        this.position.x = this.moveDistance;
        this._addOffset(-1);
        this.vel.x = 0;
      }
    }
  }

  _addOffset(sign) {
    this.position.x += this.offSet * sign
  }

  // collision methods
  get getBottom() { return this.position.y + this.height; }
  get getTop() { return this.position.y; }
  get getLeft() { return this.position.x; }
  get getRight() { return this.position.x + this.width; }
  get getOldBottom() { return this.oldPosition.y + this.height; }
  get getOldTop() { return this.oldPosition.y; }
  get getOldLeft() { return this.oldPosition.x; }
  get getOldRight() { return this.oldPosition.x + this.width; }
  set setBottom(y) { this.position.y = y - this.height; }
  set setTop(y) { this.position.y = y; }
  set setLeft(x) { this.position.x = x; }
  set setRight(x) { this.position.x = x - this.width; }
}