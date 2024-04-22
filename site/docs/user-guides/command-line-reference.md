---
sidebar_position: 1
---
# Command Line Reference

## Usage

`cloudsite <options> <command>`

## Main options

|Option|Description|
|------|------|
|`<command>`|(_main argument_,_optional_) The command to run or a sub-command group.|
|`--format`|Sets the format for the output. May be 'terminal' (default), 'text', 'json', or 'yaml'.|
|`--help`, `-?`|Prints general or command specific help.|
|`--no-color`|Disables terminal colorization.|
|`--no-reminders`, `-R`|Suppresses any reminders. Particularly useful for programmatic usage where the extra output might break things.|
|`--quiet`, `-q`|Makes informational output less chatty.|
|`--sso-profile`|The AWS local SSO profile to use for authentication.|
|`--throw-error`|In the case of an exception, the default is to print the message. When --throw-error is set, the exception is left uncaught.|
|`--verbose`|Activates verbose (non-quiet mode) even in situations where quiet would normally be implied.|

## Commands

- [`cleanup`](#cloudsite-cleanup): Attempts to fully delete partially deleted sites in the 'needs to be cleaned up' state.
- [`configuration`](#cloudsite-configuration): Command group for managing the Cloudsite CLI configuration.
- [`create`](#cloudsite-create): Creates a new website, setting up infrastructure and copying content.
- [`destroy`](#cloudsite-destroy): Destroys the named site. I.e., deletes all cloud resources associated with the site.
- [`detail`](#cloudsite-detail): Prints details for the indicated site.
- [`document`](#cloudsite-document): Generates self-documentation in Markdown format.
- [`get-iam-policy`](#cloudsite-get-iam-policy): Prints an IAM policy suitable for operating cloudsite.
- [`import`](#cloudsite-import): Generates a site database based on currently deployed site stacks.
- [`list`](#cloudsite-list): Lists the sites registered in the local database.
- [`plugin-settings`](#cloudsite-plugin-settings): Command group for managing plugin settings.
- [`reminders`](#cloudsite-reminders): Command group for managing reminders.
- [`update`](#cloudsite-update): Updates a website content and/or infrastructure.
- [`verify`](#cloudsite-verify): Verifies the site is up and running and that the stack and content are up-to-date.

<span id="cloudsite-cleanup"></span>
### `cloudsite cleanup <options> <apex-domain>`

Attempts to fully delete partially deleted sites in the 'needs to be cleaned up' state.

#### `cleanup` options

|Option|Description|
|------|------|
|`<apex-domain>`|(_main argument_,_optional_) Specifies the site to clean up rather than trying to cleanup all pending sites.|
|`--list`|Lists the sites in need of cleaning up.|

<span id="cloudsite-configuration"></span>
### `cloudsite configuration [subcommand]`

Command group for managing the Cloudsite CLI configuration.

#### `configuration` options

|Option|Description|
|------|------|
|`[subcommand]`|(_main argument_,_required_) The configuration action to perform.|


#### Subcommands

- [`setup-local`](#cloudsite-configuration-setup-local): Runs the local setup wizard and updates all options. This should be used after the SSO account has been created (see 'cloudsite configuration setup-sso').
- [`setup-sso`](#cloudsite-configuration-setup-sso): Runs the SSO wizard and sets up the SSO user authentication in the IAM Identity Center.
- [`show`](#cloudsite-configuration-show): Displays the current configuration.

<span id="cloudsite-configuration-setup-local"></span>
##### `cloudsite configuration setup-local`

Runs the local setup wizard and updates all options. This should be used after the SSO account has been created (see 'cloudsite configuration setup-sso').

<span id="cloudsite-configuration-setup-sso"></span>
##### `cloudsite configuration setup-sso <options>`

Runs the SSO wizard and sets up the SSO user authentication in the IAM Identity Center.

###### `setup-sso` options

|Option|Description|
|------|------|
|`--defaults`|Use the defaults were possible and skip unnecessary interactive setup.|
|`--delete`|Confirms deletion of the Access keys after setting up the SSO access. If neither '--delete' nor '--no-delete' are set, then deletion will be interactively confirmed.|
|`--group-name`|The name of the group to create or reference. This group will be associated with the permission set and user.|
|`--instance-name`|The name to assign to the newly created identity center, if needed.|
|`--instance-region`|The region in which to set up the identity center if no identity center currently set up. Defaults to 'us-east-1'.|
|`--no-delete`|Retains the Access keys after setting up SSO access.|
|`--policy-name`|The name of the policy and permission set to create or reference.|
|`--sso-profile`|The name of the local SSO profile to create.|
|`--user-email`|The primary email to associate with the user.|
|`--user-family-name`|The family name of the cloudsite management user.|
|`--user-given-name`|The given name of the cloudsite management user.|
|`--user-name`|The name of the user account to create or reference.|

<span id="cloudsite-configuration-show"></span>
##### `cloudsite configuration show`

Displays the current configuration.

<span id="cloudsite-create"></span>
### `cloudsite create <options> <apex-domain>`

Creates a new website, setting up infrastructure and copying content.

#### `create` options

|Option|Description|
|------|------|
|`<apex-domain>`|(_main argument_,_optional_) The site apex domain.|
|`--bucket-name`|The name of the bucket to be used. If no option is given, cloudsite will generate a bucket name based on the apex domain.|
|`--no-build`|Supresses the default behavior of building before uploading the site content.|
|`--no-delete-on-failure`|When true, does not delete the site stack after setup failure.|
|`--no-interactive`|Suppresses activation of the interactive setup where it would otherwise be activated.|
|`--option`|A combined name-value pair: &lt;name&gt;:&lt;value&gt;. Can be used multiple times. With '--delete', the value portion is ignored and can be omitted, e.g.: '--option &lt;name&gt;'.|
|`--region`|The region where to create the site resources. Defaults to 'us-east-1'.|
|`--source-path`|Local path to the static site root.|
|`--source-type`|May be either 'vanilla' or 'docusaurus', otherwise process will attempt to guess.|
|`--stack-name`|Specify the name of the stack to be created and override the default name.|

<span id="cloudsite-destroy"></span>
### `cloudsite destroy <options> [apex-domain]`

Destroys the named site. I.e., deletes all cloud resources associated with the site.

#### `destroy` options

|Option|Description|
|------|------|
|`[apex-domain]`|(_main argument_,_required_) The domain of the site to delete.|
|`--confirmed`|Skips the interactive confirmation and destroys the resources without further confirmation.|

<span id="cloudsite-detail"></span>
### `cloudsite detail [apex-domain]`

Prints details for the indicated site.

#### `detail` options

|Option|Description|
|------|------|
|`[apex-domain]`|(_main argument_,_required_) The domain of the site to detail.|

<span id="cloudsite-document"></span>
### `cloudsite document <options>`

Generates self-documentation in Markdown format.

#### `document` options

|Option|Description|
|------|------|
|`--prefix`|A string to prefix to the standard output.|
|`--section-depth`|An integer indicating initial header 'depth', where '1' means start with an 'H1/#' section header, '2' means start with an 'H2/##' section header, etc. This is useful when the documentation is embedded in other docs.|
|`--title`|The title of the top level section header.|

<span id="cloudsite-get-iam-policy"></span>
### `cloudsite get-iam-policy <options>`

Prints an IAM policy suitable for operating cloudsite.

#### `get-iam-policy` options

|Option|Description|
|------|------|
|`--with-instructions`|When set, will print instructions for creating the policy along with the policy.|

<span id="cloudsite-import"></span>
### `cloudsite import <options> [domain-and-stack]`

Generates a site database based on currently deployed site stacks.

#### `import` options

|Option|Description|
|------|------|
|`[domain-and-stack]`|(_main argument_,_required_) The domain and stack are specified as positional parameters, in either order.|
|`--common-logs-bucket`|Specifies the common logs bucket name. This is only necessary if there are multiple candidates, otherwise cloudsite can usually guess. Set to 'NONE' to suppress guessing and assume there is on common logs bucket.|
|`--refresh`|By defaualt, cloudsite will refuse to overwrite existing site DB entries. if '--refresh' is true, then it will update/refresh the existing entry.|
|`--region`|Specifies the region where the stack is to be found.|
|`--source-path`|Local path to the static site root.|
|`--source-type`|May be either 'vanilla' or 'docusaurus', otherwise process will attempt to guess.|

<span id="cloudsite-list"></span>
### `cloudsite list <options>`

Lists the sites registered in the local database.

#### `list` options

|Option|Description|
|------|------|
|`--all-fields`|Includes all fields in the output.|

<span id="cloudsite-plugin-settings"></span>
### `cloudsite plugin-settings [subcommand]`

Command group for managing plugin settings.

#### `plugin-settings` options

|Option|Description|
|------|------|
|`[subcommand]`|(_main argument_,_required_) The subcommand to execute.|


#### Subcommands

- [`set`](#cloudsite-plugin-settings-set): Sets and deletes the specified options.
- [`show`](#cloudsite-plugin-settings-show): Displays the plugin settings for the specified site.

<span id="cloudsite-plugin-settings-set"></span>
##### `cloudsite plugin-settings set <options> [apex-domain]`

Sets and deletes the specified options.

###### `set` options

|Option|Description|
|------|------|
|`[apex-domain]`|(_main argument_,_required_) The apex domain of the site to configure.|
|`--confirmed`|When entirely deleting (disabling) a plugin, you must either confirm interactively or provide the '--confirmed' option.|
|`--delete`|When set, then deletes the setting. Incompatible with the '--value' option. To delete all plugin settings (disable the plugin), set '--name' or '--option' to the bare plugin name; e.g.: --value aPlugin.|
|`--name`|The option name.|
|`--option`|A combined name-value pair: &lt;name&gt;:&lt;value&gt;. Can be used multiple times. With '--delete', the value portion is ignored and can be omitted, e.g.: '--option &lt;name&gt;'.|
|`--value`|The setting value. Incompatible with the '--delete' option.|

<span id="cloudsite-plugin-settings-show"></span>
##### `cloudsite plugin-settings show [apex-domain]`

Displays the plugin settings for the specified site.

###### `show` options

|Option|Description|
|------|------|
|`[apex-domain]`|(_main argument_,_required_) The apex domain of the site whose settings are to be displayed.|

<span id="cloudsite-reminders"></span>
### `cloudsite reminders [subcommand]`

Command group for managing reminders.

#### `reminders` options

|Option|Description|
|------|------|
|`[subcommand]`|(_main argument_,_required_) The subcommand to execute.|


#### Subcommands

- [`list`](#cloudsite-reminders-list): List currently active reminders.

<span id="cloudsite-reminders-list"></span>
##### `cloudsite reminders list`

List currently active reminders.

<span id="cloudsite-update"></span>
### `cloudsite update <options> [apex-domain]`

Updates a website content and/or infrastructure.

#### `update` options

|Option|Description|
|------|------|
|`[apex-domain]`|(_main argument_,_required_) The apex domain identifying the site.|
|`--do-billing`|Limits updates to billing related matters (cost allocation tags) and other other specified updates.|
|`--do-content`|Limits update to site content and any other specified updates.|
|`--do-dns`|Limits update to DNS entries and any other specified updates.|
|`--do-stack`|Limits update to stack infrastructure and any other specified updates.|
|`--no-build`|Supresses the default behavior of building before updating the site.|
|`--no-cache-invalidation`|Suppresses the default behavior of invalidating the CloudFront cache after the files are updated. Note that invalidation events are chargeable thought at the time of this writing, each account gets 1,000 free requests per year.|

<span id="cloudsite-verify"></span>
### `cloudsite verify <options> [apex-domain]`

Verifies the site is up and running and that the stack and content are up-to-date.

#### `verify` options

|Option|Description|
|------|------|
|`[apex-domain]`|(_main argument_,_required_) The domain of the site to verify.|
|`--check-content`|If set, then checks content and skips other checks unless also specifically specified.|
|`--check-site-up`|If set, then checks that the site is up and skips other checks unless also specifically specified.|
|`--check-stack`|If set, then checks for stack drift and skips other checks unless also specifically specified.|


