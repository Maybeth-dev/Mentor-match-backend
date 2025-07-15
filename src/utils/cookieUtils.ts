 export function getCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [cookieName, ...cookieValueParts] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValueParts.join('='); // In case the value contains '='
    }
  }
  return null;
}
// // For parsing incoming cookies in requests
// export function parseCookies(cookieHeader?: string): Record<string, string> {
//   if (!cookieHeader) return {};
  
//   return cookieHeader
//     .split(';')
//     .reduce((cookies, cookie) => {
//       const [name, value] = cookie.trim().split('=').map(decodeURIComponent);
//       return { ...cookies, [name]: value };
//     }, {});
// }
 
// export function setCookie(
//   res: express.Response,
//   name: string,
//   value: string,
//   options: {
//     maxAge?: number;
//     httpOnly?: boolean;
//     secure?: boolean;
//     sameSite?: 'strict' | 'lax' | 'none';
//   } = {}
// ) {
//   let cookie = `${name}=${encodeURIComponent(value)}`;
  
//   if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
//   if (options.httpOnly) cookie += '; HttpOnly';
//   if (options.secure) cookie += '; Secure';
//   if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  
//   res.setHeader('Set-Cookie', cookie);
// }
