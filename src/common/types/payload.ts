export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
}

export interface InvitationPayload {
  email: string;
  teamId: string;
  roleId: string;
  invitedById: string;
}
