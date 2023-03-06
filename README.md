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
npm start --port /dev/ttyUSB0
```

You can also specify the file to load with the `--load` option:

```
npm start --load /path/to/file
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

## Weekly Alarm Format

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

## Scheduled Alarm Format

```
L - SCHEDULE ----- ALARM - 1
d  - - - - -  02/02 A12:00 1
d  - - - - -  04/01 P09:10 1
d  - - - - -  01/01 A12:00 1
d  - - - - -  01/01 A12:00 1
```

## Memo Format

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
