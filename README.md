# Sekio RC-4000

Sekio RC-4000 Manager.

NodeJS command line tool to manage Sekio RC-1000 / RC-4000 devices.

Information on the Sekio RC-1000/RC-4000 including data sheets and downloads can be found here: http://www.z88dx.com

## Installation

# Requirements

* NodeJS 12.0.0 or higher
* Yarn 1.0.0 or higher

# Install

```
yarn
```

## Usage

The watch manager is a command line tool. It can be used with the following command:

```
npm start

or

node index.js
```

You can also specify the port to use with the `--port` option:

```
node index.js --port /dev/ttyUSB0
```

You can also specify the file to load with the `--load` option:

```
node index.js --load /path/to/file
```


## Troubleshooting

If you get the error `Error: Permission denied, cannot open /dev/ttyUSB0`.

Try the following command:

```
sudo chmod 666 /dev/ttyUSB0
```

This will be reset once you disconnect the device. So you need to run this command each time you connect the device.

# Data File Format

The data file uses the origial data format from the Sekio RC-4000 MSDOS application.  The files are interchangeable between the two applications.

There is probably no reason to do this, but I did it anyway.  If you happen to have an old data file for your watch it will work just fine.

## Data File Specifications

There is no documentation for the original sekio data file format.  The following is what i managed to work out from the data file.

## Start of File Marker

The header of the file consists of a space (0x20) + number of lines of data + 0x0D + 0x0A.

For example the following header is for a file with 18 lines of data:

```
 0x20 0x31 0x38 0x0D 0x0A
```

## Label & Data Entries

There are 2 types of data:
- L - Label
- d - Data

There are 3 sub-sets of the label:
- 2 Weekly Alarms
- 1 Scheduled Alarm
- 0 Memos

Upto a maximum of 11 labels are possible, 1 week alarm, 1 scheduled alarm and 9 memos.  If you skip the alarms this means you can create upto 11 memo labels.

There does not appear to be limit of the number of data entries.  Thus it should be possible to create one memo label + 79 data entries. Although navigating those on watch is probably not much fun.  Best is to limi the number of data entries to 5 or 6 per label.

The total number of entries is limited to 80 (labels + data).


## Label Format

The label is 24 bytes long.  The watch display 2 lines of 12 characters.  The label is split into 2 lines.

The label is identified by 0x4C (L) followed by a space, 24 bytes of data a space and label type.

- 2 Weekly Alarms
- 1 Scheduled Alarm
- 0 Memos

The label has the following format

L[SPACE][label][SPACE][label type][0x0D 0x0A]

```
L - WEEKLY ------- ALARM - 2
L - SCHEDULE ----- ALARM - 1
L - PHONE ------   MEMO  - 0
```

## Weekly Alarm Data Format

Weekly alarms are those set for a specific day of the week and repeat every week.

Only one weekly alarm label is possible.  The weekly alarm label must be the first label in the file and is the first label sent to the watch.

The weekly data entry alarm is 24 bytes long.  12 bytes for the label and 12 bytes to define the alarm.

The format is [#day] [DAY] ][AM/PM] [hour] [minute]

The #day number starts at 0 for sunday. 7 indicates every day.

The day is a 3 character string: SUN, MON, TUE, WED, THU, FRI, SAT, DAY (every day)

The AM/PM is a 1 character string: A or P.

The hour is a 2 character string: 00 to 12.  (12 is 12:00am)

The minute is a 2 character string: 00 to 59.

The saved data structure is as follows:

d[SPACE][label][#day][SPACE][DAY][SPACE][A|P][hour]:[minute][SPACE]2[0x0D 0x0A]

0x0D 0x0A is the new line character.

It's not really clear to me why the day is specified twice. Maybe there was just space left over in the data structure.

```
L - WEEKLY ------- ALARM - 2
d  - - - - -  1 MON A12:00 2
d  - - - - -  2 TUE A12:00 2
d  - - - - -  3 WED A12:00 2
d  - - - - -  4 THU A12:00 2
d  - - - - -  5 FRI A12:00 2
d  - - - - -  6 SAT A12:00 2
d  - - - - -  0 SUN A12:00 2
d  - - - - -  7 DAY A12:00 2
```

## Scheduled Alarm Data Format

Scheduled alarms are those set for a specific date.  THis label should appear directly after the weekly alarm label or first, if there is no weekly alarm label.

Only one scheduled alarm label is possible.

The scheduled data entry alarm is 24 bytes long.  12 bytes for the label and 12 bytes to define the alarm.

The format is [MONTH]/[DAY] [AM/PM] [hour] [minute]

The MONTH number starts at 01 for January.

The DAY number starts at 01 for the first day of the month. You could enter 31 for February, but it would push the alarm to the next month.

The AM/PM is a 1 character string: A or P.

The hour is a 2 character string: 00 to 12.  (12 is 12:00am)

The minute is a 2 character string: 00 to 59.

The saved data structure is as follows:

d[SPACE][label][MONTH]/[DAY][SPACE][A|P][hour]:[minute][SPACE]1[0x0D 0x0A]

0x0D 0x0A is the new line character.

```
L - SCHEDULE ----- ALARM - 1
d  - - - - -  02/02 A12:00 1
d  - - - - -  04/01 P09:10 1
d  - - - - -  01/01 A12:00 1
d  - - - - -  01/01 A12:00 1
```

## Memo Data Format

The memo data entry is 24 bytes long.  The watch can display 2 lines of 12 characters each.  The watch will only display upper case ascii characters in the range 32 to 126. Any lower case characters will be displayed as upper case.

The data structure is as follows:

d[SPACE][label][SPACE]0[0x0D 0x0A]

0x0D 0x0A is the new line character.

```
L - FLIGHT ---- SCHEDULE - 0
d NYC-LON     BA178 13:45  0
d NRT-LAX     JL062 17:40  0
d JFK-ORD     AA456 13:30  0
L - PHONE ------ NUMBERS - 0
d ABC CORP    012-234-2314 0
d RICHARD D   045-364-1453 0
d JANE B      053-156-2314 0
d DOC KURTZ   098-136-2931 0
d BOB-HOME    034-967-1789 0
```


## End of file marker

The end of the file appears to consist of the total number of labels + 0x1A (0x1A is the end of file marker).

Example is for 4 labels
```
0x20 0x20 0x34 0x0D 0x0A 0x1A
```


# Development

Some notes on development.  The application works both on the command line and in electron. Electron is used to provide a GUI. It was a bit tricky to get both running in the same environment as electron is not working with all the packages I used in the command line version.  This is due to the fact that electron is unfriendly with ES6 modules.

## Electron

To keep the application running with electronmon and auto reload on changes run:

```
npx electronmon index-electron.cjs
```

The serialport package needs to be rebuilt for electron. Everytime you add a package run this:

```
npm run rebuild
```

## Electron Force

You can only build the deb target on Linux or macOS machines with the fakeroot and dpkg packages installed.

```
sudo apt-get install fakeroot dpkg rpm
npm run make
```
