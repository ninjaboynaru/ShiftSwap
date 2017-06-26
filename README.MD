

# Shift Swap
**Shift Swap** is a static front end JavaScript/HTML application run from the users browser that allows
members of a work group to view and sort *shifts* up for trade/grabs posted in a Facebook group.  

A demo FB group is provided for viewing how the app functions (employers, new users).

  
Posts made on the Facebook group must conform to a syntax/structure.
> See **docs/ShiftData_Posts.MD**

### 2 Applications
Shift swap is divided into 2 applications.
	- Shift Swap Admin *(Grabs and parses posts in FB group. Uploads to cloud storage)*
	- Shift Swap User *(Retreives data from cloud storage, filter and sort. Display to user)*
	
---

### External APIs used
- Facebook API 2.9
- Firebase API
- *Firebase is a google cloud backend platform with many functions such as database, storage, and authentication.*

### External Libraries used
- JQUERY
- JQUERY UI (used in ShiftSwap User)
- Custom Dropdown System (used in ShiftSwap User) (**dropdown.js and dropdown.css**)


### Shift Swap Admin
**Shift Swap Admin** uses the Facebook API to grab posts from the Facebook group. It parses them into JSON objects, and then uploads them to
a Firebase cloud storage to be later read by a ShiftSwap User.

The admin must log into their Facebook account.

If the admin is not the administrator of the FB group then they will not be able to get data from the FB page.
The admin's unique Firebase app id has been added to the Firebase storage auth rules so only they can upload to the cloud storage.

### Shift Swap User
**Shift Swap User** reads the JSON shift data from the Firebase cloud storage. It filters and sorts the data and then displays it
to the end-user.

The user must log into facebook but there is no actual verification or authentication of the user.


### Security
> See **_docs/ShiftData_Security.MD_**

### JSON
For the JSON format the posts are parsed into
> See **_docs/ShiftData_JSON_**










