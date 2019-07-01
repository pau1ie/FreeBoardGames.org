import React from 'react';
import { IGameArgs } from '../../App/Game/GameBoardWrapper';
import { GameLayout } from '../../App/Game/GameLayout';
import { Grid } from '@freeboardgame.org/boardgame.io/ui';
import { Token } from '@freeboardgame.org/boardgame.io/ui';
import { IG, IScore, IPieceTransform, rotatePiece, flipPieceY, flipPieceX, getPlayer } from './game';
import { IGameCtx } from '@freeboardgame.org/boardgame.io/core';
//import { Scoreboard } from './Scoreboard';
import { GameMode } from '../../App/Game/GameModePicker';
import AlertLayer from '../../App/Game/AlertLayer';
import css from './Board.css';

import red from '@material-ui/core/colors/red';
import yellow from '@material-ui/core/colors/yellow';
import green from '@material-ui/core/colors/lightGreen';
import blue from '@material-ui/core/colors/blue';
import grey from '@material-ui/core/colors/grey';

import Done from '@material-ui/icons/Done';
import RotateLeft from '@material-ui/icons/RotateLeft';
import RotateRight from '@material-ui/icons/RotateRight';
import Flip from '@material-ui/icons/Flip';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Close from '@material-ui/icons/Close';

import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import EndGameDialog from './EndGameDialog';

import { pieces } from './pieces';

export interface ICoords {
  x: number;
  y: number;
}

export interface IColorMap {
  [key: string]: string;
}

interface IBoardProps {
  G: IG;
  ctx: IGameCtx;
  moves: any;
  playerID: string;
  gameArgs?: IGameArgs;
}

interface IBoardState {
  pieceTransform: IPieceTransform;
  pieceIndex: number;
  piece: boolean[];
  dialogOpen: boolean;
}

export class Board extends React.Component<IBoardProps, IBoardState> {
  constructor(props: IBoardProps) {
    super(props);
    this.state = {
      pieceTransform: { x: 10, y: 10, rotation: 0, flipX: false, flipY: false },
      pieceIndex: 0,
      piece: pieces[0],
      dialogOpen: true,
    };
  }

  _placePiece = this.placePiece.bind(this);
  _flipY = this.flipY.bind(this);
  _flipX = this.flipX.bind(this);
  _openDialog = this.openDialog.bind(this);
  _closeDialog = this.closeDialog.bind(this);
  _endGame = this.endGame.bind(this);

  placePiece() {
    this.props.moves.placePiece(this.state.pieceIndex, this.state.pieceTransform);
  }

  rotate(n: number) {
    let piece = rotatePiece(this.state.piece);
    for (let i = 0; i < n - 1; i++) {
      piece = rotatePiece(piece);
    }
    this.setState({
      ...this.state,
      pieceTransform: { ...this.state.pieceTransform, rotation: (this.state.pieceTransform.rotation + n) % 4 },
      piece,
    });
  }

  flipY() {
    this.setState({
      ...this.state,
      pieceTransform: {
        ...this.state.pieceTransform,
        flipY: !this.state.pieceTransform.flipY,
        rotation:
          this.state.pieceTransform.rotation % 2 === 0
            ? this.state.pieceTransform.rotation
            : (this.state.pieceTransform.rotation + 2) % 4,
      },
      piece: flipPieceY(this.state.piece),
    });
  }

  flipX() {
    this.setState({
      ...this.state,
      pieceTransform: {
        ...this.state.pieceTransform,
        flipX: !this.state.pieceTransform.flipX,
        rotation:
          this.state.pieceTransform.rotation % 2 === 0
            ? this.state.pieceTransform.rotation
            : (this.state.pieceTransform.rotation + 2) % 4,
      },
      piece: flipPieceX(this.state.piece),
    });
  }

  select(offset: number) {
    const playerID = getPlayer(this.props.ctx, this.props.ctx.currentPlayer);
    const pieceIndex = (this.state.pieceIndex + offset) % this.props.G.players[playerID as any].length;
    this.setState({
      ...this.state,
      pieceIndex,
      piece: pieces[this.props.G.players[playerID as any][pieceIndex]],
      pieceTransform: { ...this.state.pieceTransform, flipX: false, flipY: false, rotation: 0 },
    });
  }

  openDialog() {
    this.setState({ ...this.state, dialogOpen: true });
  }

  closeDialog() {
    this.setState({ ...this.state, dialogOpen: false });
  }

  endGame() {
    this.props.moves.endGame();
  }
  /*
    _getGameOver() {
        const scoreboard: IScore[] = this.props.ctx.gameover.scoreboard;
        if (scoreboard[0].score === scoreboard[scoreboard.length - 1].score) {
            return 'draw';
        } else {
            if (scoreboard[0].score === scoreboard[this.props.playerID as any].score) {
                return 'you won';
            } else {
                return 'you lost';
            }
        }
    }*/
  /*
    _getScoreBoard() {
        return (
            <Scoreboard
                scoreboard={this.props.ctx.gameover.scoreboard}
                playerID={this.props.playerID}
                players={this.props.gameArgs.players}
            />
        );
    }*/

  isLocalGame() {
    return this.props.gameArgs && this.props.gameArgs.mode === GameMode.LocalFriend;
  }

  _getStatus() {
    if (!this.props.gameArgs) {
      return;
    }

    let message = '';
    if (this.isLocalGame()) {
      let player;
      switch (this.props.ctx.currentPlayer) {
        case '0': {
          player = 'Red';
          break;
        }
        case '1': {
          player = 'Green';
          break;
        }
      }
      message = `${player}'s turn`;
    } else if (this.props.ctx.currentPlayer === this.props.playerID && !this.isLocalGame()) {
      message = 'Place piece';
    } else if (this.props.ctx.currentPlayer !== this.props.playerID && !this.isLocalGame()) {
      message = 'Waiting for opponent...';
    }
    return message;
  }

  _onDrop = (coords: { x: number; y: number; originalX: number; originalY: number }) => {
    const x = Math.round(coords.x);
    const y = Math.round(coords.y);
    this.setState({ ...this.state, pieceTransform: { ...this.state.pieceTransform, x, y } });
  };

  componentDidUpdate(prevProps: IBoardProps) {
    if (prevProps.ctx.currentPlayer !== this.props.ctx.currentPlayer) {
      this.setState({
        ...this.state,
        pieceIndex: 0,
        piece: pieces[this.props.G.players[getPlayer(this.props.ctx, this.props.ctx.currentPlayer) as any][0]],
        pieceTransform: { ...this.state.pieceTransform, flipX: false, flipY: false, rotation: 0, x: 10, y: 10 },
      });
    }
  }

  render() {
    /*
        if (this.props.ctx.gameover) {
            return (
                <GameLayout
                    gameOver={this._getGameOver()}
                    extraCardContent={this._getScoreBoard()}
                    gameArgs={this.props.gameArgs}
                />
            );
        }*/

    const colorMap = this.getColorMap();

    const colors = [blue[500], yellow[500], red[500], green[500]];

    return (
      <div>
        <EndGameDialog open={this.state.dialogOpen} handleClose={this._closeDialog} accept={this._endGame} />
        <GameLayout>
          <Typography variant="h5" style={{ textAlign: 'center', color: 'white', marginBottom: '16px' }}>
            {this._getStatus()}
          </Typography>
          <Grid rows={20} cols={20} onClick={() => null} colorMap={colorMap}>
            {this.props.G.board
              .map((square, index) => ({ square, index }))
              .filter(piece => piece.square !== null)
              .map(piece => (
                <Token x={piece.index % 20} y={Math.floor(piece.index / 20)} key={piece.index}>
                  <rect width="1" height="1" style={{ fill: colors[piece.square as any] }} className={css.Piece}></rect>
                </Token>
              ))}
            {this.isLocalGame() || this.props.ctx.currentPlayer === this.props.playerID ? (
              <Token
                x={this.state.pieceTransform.x}
                y={this.state.pieceTransform.y}
                draggable={true}
                shouldDrag={() => true}
                onDrop={this._onDrop}
              >
                <g>
                  <g fill={colors[getPlayer(this.props.ctx, this.props.ctx.currentPlayer) as any]} opacity={0.8}>
                    {this.state.piece
                      .map((square, index) => ({ square, index }))
                      .filter(piece => piece.square)
                      .map(piece => (
                        <rect
                          x={piece.index % Math.sqrt(this.state.piece.length)}
                          y={Math.floor(piece.index / Math.sqrt(this.state.piece.length))}
                          width="1"
                          height="1"
                          key={piece.index}
                        ></rect>
                      ))}
                  </g>
                  <rect width="50" height="50" x="-25" y="-25" fill="none" style={{ pointerEvents: 'all' }}></rect>
                </g>
              </Token>
            ) : (
              <div></div>
            )}
          </Grid>
          <div className={css.Controls}>
            <IconButton onClick={() => this.rotate(3)}>
              <RotateLeft />
            </IconButton>
            <IconButton onClick={() => this.rotate(1)}>
              <RotateRight />
            </IconButton>
            <IconButton onClick={this._flipY} style={{ transform: 'rotate(90deg)' }}>
              <Flip />
            </IconButton>
            <IconButton onClick={this._flipX}>
              <Flip />
            </IconButton>
            <IconButton
              onClick={() =>
                this.select(
                  this.props.G.players[getPlayer(this.props.ctx, this.props.ctx.currentPlayer) as any].length - 1,
                )
              }
            >
              <ChevronLeft />
            </IconButton>
            <IconButton onClick={() => this.select(1)}>
              <ChevronRight />
            </IconButton>
            <IconButton onClick={this._placePiece}>
              <Done />
            </IconButton>
            <IconButton onClick={this._openDialog}>
              <Close />
            </IconButton>
          </div>
        </GameLayout>
      </div>
    );
  }

  getColorMap(): IColorMap {
    const colorMap = {} as IColorMap;
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        const key = `${x},${y}`;
        let color = grey[800];
        if (x === 0 && y === 0) {
          color = blue[500];
        } else if (x === 19 && y === 0) {
          color = yellow[500];
        } else if (x === 19 && y === 19) {
          color = red[500];
        } else if (x === 0 && y === 19) {
          color = green[500];
        } else if ((x + y) % 2 === 0) {
          color = grey[900];
        }
        colorMap[key] = color;
      }
    }
    return colorMap;
  }
}
