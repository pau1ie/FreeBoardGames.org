const Thumbnail = require('./media/thumbnail.jpg');
import { GameMode } from 'components/App/Game/GameModePicker';
import { IGameDef } from 'games';
import instructions from './instructions.md';

export const checkersGameDef: IGameDef = {
  code: 'checkers',
  name: 'Checkers',
  imageURL: Thumbnail,
  modes: [{ mode: GameMode.AI }, { mode: GameMode.OnlineFriend }, { mode: GameMode.LocalFriend }],
  minPlayers: 2,
  maxPlayers: 2,
  description: 'a Classic Game',
  descriptionTag: `Play Checkers (also known as Draughts) locally
  or online against friends!`,
  instructions: {
    videoId: 'yFrAN-LFZRU',
    text: instructions,
  },
  config: () => import('./config'),
  aiConfig: () => import('./ai'),
};
