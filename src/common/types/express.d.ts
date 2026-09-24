import {
  AccessTokenPayload,
  InvitationPayload,
  RefreshTokenPayload,
} from "./payload.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}
