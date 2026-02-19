import {
  OAuthProviderInterface,
  OAuthTokens,
  StandardUserData,
  OAuthError,
} from "./OAuthProvider";
import * as crypto from "crypto";
import { GOOGLE_CLIENT_ID } from "./_publicConfigs";

export class GoogleOAuthProvider implements OAuthProviderInterface {
  public readonly name = "google";
  public readonly clientId: string;
  public readonly authUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  public readonly scopes = "openid email profile";
  public readonly redirectUri: string;
  private readonly clientSecret: string;
  private readonly tokenUrl = "https://oauth2.googleapis.com/token";
  private readonly userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

  constructor(redirectUri: string) {
    this.clientId = GOOGLE_CLIENT_ID;
    // Note: In a real browser environment, process.env is not available.
    // However, this code is likely running in a Node.js context (e.g. server-side API route)
    // or the build system replaces process.env.GOOGLE_CLIENT_SECRET.
    // Since the prompt explicitly asked for process.env.GOOGLE_CLIENT_SECRET, we use it.
    // If this runs on the client, the secret won't be available, which is correct for security (PKCE flow without secret),
    // but Google's web flow usually requires a secret for "web server" apps or no secret for "SPA" apps.
    // Assuming this is used in the backend API handler for token exchange.
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    this.redirectUri = redirectUri;

    if (!this.clientId) {
      const error = new Error(
        "GOOGLE_CLIENT_ID is missing from public configs"
      );
      console.error("GoogleOAuthProvider initialization failed:", error);
      throw error;
    }

    // We don't throw if secret is missing because some flows (SPA) might not need it,
    // though typically for the backend exchange it is required.
    if (!this.clientSecret) {
      console.warn(
        "GoogleOAuthProvider: GOOGLE_CLIENT_SECRET is missing. Token exchange might fail if this is a confidential client."
      );
    }
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<OAuthTokens> {
    console.log(
      "GoogleOAuthProvider: Exchanging authorization code for tokens",
      {
        codeLength: code.length,
        redirectUri,
        hasPKCE: !!codeVerifier,
        codeVerifierLength: codeVerifier?.length,
      }
    );

    // Google requires application/x-www-form-urlencoded for token exchange
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("client_id", this.clientId);
    params.append("client_secret", this.clientSecret);
    params.append("redirect_uri", redirectUri);
    if (codeVerifier) {
      params.append("code_verifier", codeVerifier);
    }

    let response: Response;
    try {
      response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
    } catch (fetchError) {
      console.error("GoogleOAuthProvider: Token exchange fetch error:", {
        error:
          fetchError instanceof Error ? fetchError.message : String(fetchError),
        url: this.tokenUrl,
      });

      throw new OAuthError(
        "NETWORK_ERROR",
        `Token exchange request failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        this.name,
        fetchError
      );
    }

    if (!response.ok) {
      let errorText: string;
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = "Could not read error response body";
        console.error(
          "GoogleOAuthProvider: Failed to read error response text:",
          textError
        );
      }

      console.error(
        "GoogleOAuthProvider: Token exchange failed with error response:",
        {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          headers: Object.fromEntries(response.headers.entries()),
        }
      );

      throw new OAuthError(
        "TOKEN_EXCHANGE_FAILED",
        `Token exchange failed: ${response.status} ${response.statusText}. Response: ${errorText}`,
        this.name,
        { status: response.status, body: errorText }
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error(
        "GoogleOAuthProvider: Failed to parse token exchange response JSON:",
        {
          error:
            jsonError instanceof Error ? jsonError.message : String(jsonError),
          status: response.status,
        }
      );

      throw new OAuthError(
        "TOKEN_EXCHANGE_FAILED",
        `Token exchange succeeded but response is not valid JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
        this.name,
        jsonError
      );
    }

    if (!data.access_token) {
      throw new OAuthError(
        "TOKEN_EXCHANGE_FAILED",
        "No access token received from Google",
        this.name,
        data
      );
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || undefined,
      expiresIn: data.expires_in || undefined,
      tokenType: data.token_type || "Bearer",
      scope: data.scope || undefined,
    };
  }

  async fetchUserInfo(tokens: OAuthTokens): Promise<any> {
    const tokenType = tokens.tokenType || "Bearer";
    const authHeader = `${tokenType} ${tokens.accessToken}`;

    let response: Response;
    try {
      response = await fetch(this.userInfoUrl, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      });
    } catch (fetchError) {
      console.error("GoogleOAuthProvider: User info fetch error:", {
        error:
          fetchError instanceof Error ? fetchError.message : String(fetchError),
        url: this.userInfoUrl,
      });

      throw new OAuthError(
        "NETWORK_ERROR",
        `User info request failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        this.name,
        fetchError
      );
    }

    if (!response.ok) {
      let errorText: string;
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = "Could not read error response body";
        console.error(
          "GoogleOAuthProvider: Failed to read user info error response text:",
          textError
        );
      }

      console.error(
        "GoogleOAuthProvider: User info fetch failed with error response:",
        {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          headers: Object.fromEntries(response.headers.entries()),
          tokenType: tokenType,
          authHeaderUsed: `${tokenType} [REDACTED]`,
        }
      );

      throw new OAuthError(
        "USER_INFO_FETCH_FAILED",
        `User info fetch failed: ${response.status} ${response.statusText}. Response: ${errorText}`,
        this.name,
        { status: response.status, body: errorText }
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error(
        "GoogleOAuthProvider: Failed to parse user info response JSON:",
        {
          error:
            jsonError instanceof Error ? jsonError.message : String(jsonError),
          status: response.status,
        }
      );

      throw new OAuthError(
        "USER_INFO_FETCH_FAILED",
        `User info fetch succeeded but response is not valid JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
        this.name,
        jsonError
      );
    }

    return data;
  }

  mapUserData(userInfo: any): StandardUserData {
    if (!userInfo) {
      throw new OAuthError(
        "PROVIDER_ERROR",
        "No user info provided to map",
        this.name,
        userInfo
      );
    }

    if (!userInfo.id) {
      throw new OAuthError(
        "PROVIDER_ERROR",
        "Google user info missing required id field",
        this.name,
        userInfo
      );
    }

    if (!userInfo.email) {
      throw new OAuthError(
        "PROVIDER_ERROR",
        "Google user info missing required email field",
        this.name,
        userInfo
      );
    }

    const mappedData: StandardUserData = {
      email: userInfo.email,
      displayName: userInfo.name || userInfo.email.split("@")[0],
      avatarUrl: userInfo.picture || null,
      providerUserId: userInfo.id,
    };

    return mappedData;
  }

  private generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString("base64url");
  }

  private generateCodeChallenge(codeVerifier: string): string {
    return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  }

  generateAuthorizationUrl(state: string): {
    url: string;
    codeVerifier: string;
  } {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      access_type: "offline", // Request refresh token
      prompt: "consent", // Force consent screen to ensure refresh token is returned
    });

    const authUrl = `${this.authUrl}?${params.toString()}`;

    return { url: authUrl, codeVerifier };
  }
}