import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './env';
import { findOrCreateGoogleUser } from '../services/auth/user.service';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar_url = profile.photos?.[0]?.value ?? null;
        const google_id = profile.id;

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        const user = await findOrCreateGoogleUser({
          email,
          name,
          avatar_url,
          google_id,
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;