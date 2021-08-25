export interface UserInterface {
  _id: string;
  authId: string;
  authTokens: { accessToken: string; refreshToken: string };
  createdAt: string;
  authService?: string;
  roles: string[];
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  defaultTeamSlug: string;
  emailVerified: boolean;
  isActive: boolean;
}

export interface DeactivateUserInterface {
  status: number;
  message: string;
}

export interface UpdateUserParams {
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface UserResponseInterface {
  updatedUser: {
    firstName: string;
    lastName: string;
    avatarUrl: string;
    defaultTeamSlug: string;
    _id: string;
  };
}
