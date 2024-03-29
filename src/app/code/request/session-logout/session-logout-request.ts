import { ENDPOINTS } from '@/app/platform/request/browser/requests';
import { HTTPRequest, ResponseInstance } from '@/app/code/request/baseRequest';
import { Session } from '@/app/code/session/common/session';

export interface ISessionLogoutRequestAttributes {
  readonly sessionId: Session.SessionId;
}

export interface ISessionLogoutRequestResponse {
  readonly success: boolean;
}

export class SessionLogoutRequest extends HTTPRequest<ISessionLogoutRequestAttributes, ISessionLogoutRequestResponse, ISessionLogoutRequestResponse> {
  public static readonly staticId = 'session-logout';

  protected readonly endpoint: string = ENDPOINTS.SESSION_LOGOUT;
  public readonly id: string = SessionLogoutRequest.staticId;

  constructor() {
    super();
  }

  public async handle(): Promise<ResponseInstance<ISessionLogoutRequestResponse, ISessionLogoutRequestResponse>> {
    const response = await this.delete(this.endpoint, this.getAttributes());
    return this.doHandle(response);
  }
}
