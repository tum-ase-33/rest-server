# rest-server

[![Code Climate](https://codeclimate.com/github/tum-ase-33/rest-server/badges/gpa.svg)](https://codeclimate.com/github/tum-ase-33/rest-server)
[![Test Coverage](https://codeclimate.com/github/tum-ase-33/rest-server/badges/coverage.svg)](https://codeclimate.com/github/tum-ase-33/rest-server/coverage)
[![Issue Count](https://codeclimate.com/github/tum-ase-33/rest-server/badges/issue_count.svg)](https://codeclimate.com/github/tum-ase-33/rest-server)

> 

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies
    
    ```
    cd path/to/rest-server; npm install
    ```

3. Optional: Install first demo entries (incl. admin user)

    ```
    npm run seedDemo
    ```

    After that you can sign in with:
     - Email: superadmin@tum.de
     - Passwort: sHJzslkZn4nmTum5ps9m45g&NMndtjdls

4. Start your app
    
    ```
    npm start
    ```

## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g feathers-cli             # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers generate model                 # Generate a new Model
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## Changelog

__0.1.0__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
