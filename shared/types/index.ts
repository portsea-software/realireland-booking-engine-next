
// General types
export type ErrorType = {
    errors?: Record<string, string[]>;
    status: number;
    title?: string;
    detail?: string
    traceId: string;
    type: string
}

export type APIError = {
    statusCode: number,
    statusMessage: string,
    message: string,
    data?: Record<string, string[]>
}

export type LockedAccount = {
    individualAccountId: number,
    emailAddress: string,
}
export type Client = {
    RowNo: number,
    individual_id: number,
    first_name: string,
    last_name: string,
    email_address: string,
    individual_address: string,
    portal_account_id: number,
}

export type PortalSetting = {
    name: string,
    value: string
}