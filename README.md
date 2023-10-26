# PHP Dumper

This is a Docker extension that allows you to dump variables in your PHP code using the
well-known [Symfony VarDumper](https://symfony.com/doc/current/components/var_dumper.html) component.

![PHP Dumper](https://raw.githubusercontent.com/artifision/php-dumper-docker-extension/main/ui/public/screenshot_1.png)

## Installation

Install [Docker Desktop](https://www.docker.com/products/docker-desktop) if you don't have it already.

Run the following command in your terminal to install the extension or install it from the 
[Docker Desktop Extensions](https://hub.docker.com/extensions/artifision/php-dumper-docker-extension)
marketplace:

```shell
docker extension install artifision/php-dumper-docker-extension:latest
```

Run the following command in your project to install the VarDumper component if you don't have it already:
> *If you are using Symfony or Laravel, you don't need to install the component as it is already installed by default.*

```shell
composer require --dev symfony/var-dumper
```

## Configuration

You need to tell your PHP application to forward the dump data to the extension:

- If you have a `.env` file in your project, add the following line to it:
    ```dotenv
    VAR_DUMPER_FORMAT=server
    ```

- If you don't use a `.env` file, you can add the following line at the beginning of your PHP code:
    ```php
    $_SERVER['VAR_DUMPER_FORMAT'] = 'server';
    ```

- If your project is on a **Docker** container, you need to add the following line to your `docker-compose.yml` file
  under your PHP service configuration to allow the container to communicate with the local machine:
    ```yaml
    extra_hosts:
        - "host.docker.internal:host-gateway"
    ```
  In addition to the line above, you need to add the following line to your `.env` file or a PHP file as mentioned
  above:
    ```dotenv
    VAR_DUMPER_FORMAT=server
    VAR_DUMPER_SERVER=host.docker.internal:9912
    ```

## Usage

Open the `PHP Dumper` extension in Docker Desktop and simply call `dump()` or `dd()` function in your PHP code and the
result will be displayed in the extension.

### Caution

The extension uses ports `9912` and `9913` to communicate with your PHP application.
Make sure these ports are not used by other applications on your machine.

### Troubleshooting

If you are unable to see the dump data in the extension,
try opening the following URL in your browser to see if the extension is able to receive the data:

```
http://localhost:9913/dump
```

### Clean up

To remove the extension:

```shell
docker extension rm artifision/php-dumper-docker-extension:latest
```

### License
The PHP Dumper is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

### Credits

Logo by Smashicons from [Flaticon](https://www.flaticon.com/).