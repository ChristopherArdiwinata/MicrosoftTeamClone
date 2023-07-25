Core Assumptions
- The global owner cannot be changed
- An unlimited number of users and channels can be created
- Users and channels cannot be deleted
- There is only one owner per channel
- Every user has the authority to create a channel
- Because there is no fuction about sending messasge, I assume that in the dataStore the array of data.channel.message is an empty array[]     for the same reason, in the function channelMessageV1 the max value of start is 0, if the value of start is greater than 0 ,it will be invaild. And the value of end is always -1 since there is no more information to show


Other Assumptions
- The dataStore object can be configured however we like
- Assume that authRegister stores all information about the user in as an  object in the users object
- Users cannot accept or decline channelInvite requests
