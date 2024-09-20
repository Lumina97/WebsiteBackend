const rewire = require('rewire');
const RedditAuth = rewire("../RedditAPI/RedditAuthentication");

const readTokenFilePrivate = RedditAuth.__get__("ReadTokenFile");
const refreshAccessTokenPrivate = RedditAuth.__get__("RefreshAcessToken");


test('Authentication function should not return false', () => {
    const result = RedditAuth.GetAutheticationToken();
    expect(result).not.toBeFalsy();
});

test('Read token file should return true', () => {
    const result = readTokenFilePrivate();
    expect(result).toBeTruthy();
});

test('Refresh access token should not be false', () => {
    const result = refreshAccessTokenPrivate();
    expect(result).not.toBeFalsy();
});