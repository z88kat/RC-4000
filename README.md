# Sekio RC-4000

Sekio RC-4000 Manager.

NodeJS command line tool to manage Sekio RC-1000 / RC-4000 devices.

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

The data file uses the origial data format from the Sekio RC-4000 MSDOS application.  Thus the files are interchangeable between the two applications.