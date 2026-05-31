const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || 'study-app-22216';
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@study-app-22216.iam.gserviceaccount.com';
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCifyUu1QyN9b85\nD1KdQ1xW0/84RKBxppm0a0ktVf96ET8FRAL5QKUcFCVq+qaEXJGMZd64ZU47+UzP\naW4h1wOMBd7StYbFyp5kKmqgzJW07wmNpAunKqXtun15ttuLP36m5894eTKawL1h\nBOmgh9ciDHwum9HIlnEctU+6Hi0VHynLFCti12n3LF04xvTekkDNOiAMapW28M9+\nTp/kqgDWKoO9kyRP8QyvJ0nEH5kUYJU9kOceTJsGWzWNgAXLz7d8gax9HggBko56\nCxpHNvdtp3vEtEyQrDXzy9pKUi0sve+U84pMvC3RZFosdA09FXZxpwWKalC4EeAD\n7wjFNdB5AgMBAAECggEAPFUy7BGEaMz+o+Pxi5xwE3kBANZSMABof1l6QQ/2HE98\n86qN5BfBdgxw3CiWXPy1ucg1CofqpU/p2fTORFg94+ZmFhv6H0QczRoGnw924kgC\nZwmqnfWyx/J/Fgrztt7rWnMlUBjH1jeL2RLm34iwMt8p2HBYUr6w3rTfFj6QBJAG\n+sQw98B9+qNT1eIFGVXnlTYq8oCcrpXTO2HygIGtmH8Gb/fTL85IJ5qSI+4z9aIL\nlbzrb89ZKFI1tQlKPnMOTMStHDpi1NdD+BDUstuHVl9Lo4Mwdzu6qS2tE3ZrDxcr\nDvGtKATpmxT4IOrijDFBpEaPZUVQjdX9gI5b41HlFQKBgQDTPDZnrWBvJLJUZOiG\n5EuxWGBOsHc3/wITJDuzuRDwpmEmKPkgiAmoujH3AHzGihsdKXxIfGvx+7iQnY93\n4vxp7SrhqHIx1hplPLQQdyRhlFWvrHW8TA5SMMeJSwQQ7T6l57c9zgT6j+0i5tVd\n51L5/5XdPsnQ8zkme4GTSekd6wKBgQDE7s17M2nlFcY7GpHGqdA2xrxr2+hu4ty3\nOeDzUdFTqiAL1bNuXrEoHcq/rf3JFXBkJN3DT3CQDEBsPRk0DhN19hLnT685QFS1\nVxYTVliGXQ2PVvh24z7mREVCCRAota8tKhkQX1eaRj8eC2XxIW6NxH6Y26s2BG2M\nAQ8tplTeKwKBgHZ+EVrJRA40vKBg1ptMlzVNiQC7NrU/pE9OhPsFNn54Joj8dPuN\ntDVk9UBEkrngoOMT8XbL7NWaSec9q0wqFUPqWaKqFhzkqHvfuHaADvV5+zMHgCf3\nVhU+7b+TSB2iqADy4bSWy+4uLGzmpgv+Bmrct5mbbiR7O7TdlUslK9KvAoGBALQz\nlEE1BaRDbXXt1RDFmKpW5lmIC8NTwgXDZ40fA/2bweEydhL7gP4lbL5C9uRGwuZQ\nOcCbc3PMUjL5IZPZgYNCXX/eEYfAzwJ0otWlADJK+bp9KbSYMplARWOsqWWnApnA\nWNj7dUzNFLpoUar5HZGKCRHUiHFQUfF3kq0B88yrAoGAco74dPgmzstcAIBPh3ib\nXHXJoB9xwksMDn4zuUimn2kgH3/aIV6BZcKF4OZb4y3wQcsKYx9W5UWGQO4elGTL\naFh8VQ8453xkFwrXmizaHNeIdWZCh10iFxdxrS6tJDSIYuutkQpQ/gCu0kOwoAMY\nW2Yr3t3WK2wgmDFETuk5iq4=\n-----END PRIVATE KEY-----\n").replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

async function listAllUsers() {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const users = listUsersResult.users.map((userRecord) => ({
      email: userRecord.email,
      verified: userRecord.emailVerified,
      created: userRecord.metadata.creationTime,
    }));
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

listAllUsers();
