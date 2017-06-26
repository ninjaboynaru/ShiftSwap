
# Security
- Security exists in ShiftSwap Admin to verify that the user/admin is an administrator of the Facebook group they are
requesting data from. The firebase database is set up so that only someone with the admin's firebase app id may modify the database/upload to it.

- Security in the regular ShiftSwap application for users consists only of having the user login to facebook.
At the moment anyone may simply log into their facebook and access the ShiftSwap user application.

## Security Process
1. Log into Facebook
2. Log into Firebase with the Facebook access token returned by the successful Facebook login.

## ShiftSwap Admin Overview
- Login to Facebook in order to use the FB api. Only logged in admins of the FB group may request the FB group feed. Attempts by anyone else will result in an error from the FB api.

- Login to Firebase in order to write data to the Firebase storage.

- Firebase storage security rules/settings should be such that only users of certain app ids (FB admin) have the ability to write to the storage.