

# Shift JSON Format
Posts shall be parsed into the following JSON format

- month : [month int],
- day : [day int],
- year : [year int],

- startHour : [12h time int],
- endHour : [12h time int],
- startMinute : [60m time int],
- endMinute : [60m time int],

- startMilTime : [expanded millitary time int], **(See bottom for explenation)**
- endMilTime : [expanded millitary time int],

- startTimePeriod : [pm or am string],
- endTimePeriod : [pm or am string],

- exchange : [exchange string],
- extra : [extra info string]

- postLink : [link to original post string],

- error : [bool]
- errorMessage : [string]

# Exchange String
"Give", "Giving", "Trade", "Trading", "Both"


# Expanded military time
Expanded is to mean that the time may go over 24h. This is so shifts that start today but end the next day can have their times categorized and sorted in a coherent way (allow for easy sorting).  

This should only go over 24 if the start period is *pm* and the end period is *am*. No consideration is given to shifts that are 24 hours long.

**Examples of expanded mil time**
- (4:30pm - 3am) = (1630 - 2700)
- (9am - 5pm) = (0900 - 1700)
- (10pm - 6:30am) = (2200 -3000)
- (1pm - 11:30pm) = (1300 - 2330)
