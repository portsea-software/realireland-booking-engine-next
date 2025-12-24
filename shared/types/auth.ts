
// Auth Related Types 
export type AccessToken = {
    access_token: string;
    expires: string;
    expires_in: number;
    token_type: string;
}
export type UserPayload = {
    EmailAddress: string,
    Password: string,
    Name: {
        Title: string,
        FirstName: string,
        MiddleName: string,
        LastName: string,
    },
    Username: string,
    ConfirmPassword: string

}
export type ConfirmUserPayload = {
    EmailAddress: string,
    ConfirmationCode: string
}
export type LoginUserPayload = Omit<UserPayload, 'Name' | 'Username' | 'ConfirmPassword'>
export type ForgotPasswordPayload = Omit<UserPayload, 'Name' | 'Username' | 'ConfirmPassword' | 'Password'>
export type ResetPasswordPayload = Omit<UserPayload, 'Name' | 'Username' > & {
    ResetPasswordCode: string,
}

export type ParsedUser = {
    AxumUniqueId: string;
    AxumUserId: string;
    aud: string;
    email: string;
    exp: number;
    iss: string;
    jti: string;
    nbf: number;
    sub: string;
}