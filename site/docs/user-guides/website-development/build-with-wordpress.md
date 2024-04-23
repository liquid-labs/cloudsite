---
sidebar_position: 4
---
# Build with WordPress

WordPress is one of, if not the most popular and accessible website building and content management tools available. The availability of free themes, plugins, a community support make it a great choice for developing your website.
Setting up your own instance isn't hard, but there are a fair number of steps. If you're interested in something a little easier, we also provide instructions on setting up a Docusaurus based site and you can scroll to the end of this article to see a comparison of the pros and cons of each.

## Setting up WordPress locally

In this article, we'll show you how to set up WordPress on your own laptop. This allows you to develop your site without causing instability or downtime in the public site. You make and test your changes locally, and then upload those changes to the public site.

We'll be using [XAMPP](https://www.apachefriends.org/index.html) + [WordPress](https://wordpress.org). XAMPP sets up the services WordPress needs to run, all in one package. There are alternatives (such as WAMP and MAMP), but we find XAMPP to be as easy if not easier plus it's fully cross-platform supporting Windows, Mac, and Linux (hence the 'X').

### Download and install XAMMP

1. Head over to [apachefriends.org](https://www.apachefriends.org/index.html) and download the package corresponding to your operating system and install. If you're on a Mac and get a message that the installer "cannot be opened" refer to the instructions below.
2. Click 'Next' and then select whether you want to install the "Developer Files". For our purposes you can uncheck this to save a little space.
3. Click 'Next' through the rest of the defaults.
4. After installation is complete, leave 'Launch XAMPP' selected and click 'Finish'.

<div class="row" style={{margin: 'var(--ifm-spacing-vertical) 0'}}>
  <img class="col col--4" src="/img/docs/user-guides/website-development/build-with-wordpress/install-xampp-01.png" />
  <img class="col col--4" src="/img/docs/user-guides/website-development/build-with-wordpress/install-xampp-02.png" />
  <img class="col col--4" src="/img/docs/user-guides/website-development/build-with-wordpress/install-xampp-03.png" />
</div>
<div class="row" style={{margin: 'var(--ifm-spacing-vertical) 0'}}>
  <img class="col col--4" src="/img/docs/user-guides/website-development/build-with-wordpress/install-xampp-04.png" />
  <img class="col col--4" src="/img/docs/user-guides/website-development/build-with-wordpress/install-xampp-05.png" />
  <img class="col col--4" src="/img/docs/user-guides/website-development/build-with-wordpress/install-xampp-06.png" />
</div>

To fix the Mac "installer cannot be opened" issue:
1. Cancel the current install.
2. Click  → System Settings.
3. Search for 'Security settings' and click the option under 'Privacy & Security'.
4. Find where it says "xamp-xxx was blocked" and click the 'Open Anyway' button, then confirm you want to 'Open' the installer.

<div class="row" style={{margin: 'var(--ifm-spacing-vertical) 0'}}>
  <img class="col col--8" src="/img/docs/user-guides/website-development/build-with-wordpress/mac-security-install-anyway.png" />
</div>

### Run XAMPP and install WordPress

1. From the XAMPP Manager window, select the 'Manage Servers' tab at the top and click 'Start All' if any of the services are not running.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/install-wordpress-01.png" />
2. Now click 'Welcome' tab and 'Open Application Folder'. We'll come back to this in a moment.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/install-wordpress-02.png" />
3. From your browser, goto [WordPress.org](https://wordpress.org) and click 'Get WordPress' in the upper right hand corner.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/install-wordpress-03.png" />
4. Download the latest version and expand the zipfile.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/install-wordpress-04.png" />
5. Move the resulting 'wordpress' folder into 'htdocs' in the XAMPP application folder we opened in step 2.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/install-wordpress-05.png" />
6. Rename the 'wordpress' folder to 'mysite'.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/install-wordpress-06.png" />

### Setup WordPress

1. Back to phpMyAdmin, Click 'New' to create a new database for the WordPress site to use.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/setup-wordpress-01.png" />
2. Enter 'mysite' for the database name and select 'Collation' (top option) in the drop down next to the name. Click 'Create'.
3. Open a new tab in the browser and enter 'localhost/mysite' in the URL bar.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/setup-wordpress-02.png" />
4. Click 'Let's go!' and on the following page, enter 'mysite' for the database name and 'root' for the user. Hit 'Submit'.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/setup-wordpress-03.png" />
5. The WP admin panel will display the generated config file. On Windows and Linux, it will also write this file to disk for you. On Mac, you must copy the file contents and then create the file `wp-config.php` in the 'mysite' directory we created for the WP install; i.e:`/Applications/XAMPP/xampfiles/htdocs/mysite/wp-config.php` Then paste the contents you just copied into that file.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/setup-wordpress-04.png" />
6. For all users, open the `wp-config.php` that was just created and add the following line to the end:
   ```php
   define( 'FS_METHOD', 'direct' );
   ```
   And save the changes. (This fixes an asset upload issue.)
7. Now, back to the WP setup in the browser, hit 'Run the installation'.
8. On this final setup page, enter the public, brand name of the site and your username, a password, and your email address. Since this is a purely local setup you don't need to worry too much about making a strong password. Click 'Install WordPress'.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/setup-wordpress-05.png" />

You should now see a 'Success' message and you can log in using the username and password you just created.

### Configure permissions to enable asset uploads

On Mac and Linux, we now need to setup the 'wp' user group and update directory permissions so the WP admin portal can add themes, plugins, and site assets. I believe Windows users can skip this step (but definitely reach out to me if that's wrong and I'll update this section). The following instructions are specific to Mac, but Linux users would do the equivalent.

1. Click  → 'System Settings'
2. Search for 'groups' and select 'Users & Groups'.
3. In the groups section click 'Add Group…' and enter 'wp' as the group name and click 'Create Group'.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/enable-asset-upload-01.png" />
4. Click the 'i' next to the newly created 'wp' group and check the toggle next to your user account. Click 'OK'.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/enable-asset-upload-02.png" />
5. Update the group ownership and directory permissions:
   ```bash
   cd /Applications/XAMPP/xamppfiles/htdocs
   # change all WP files/dirs group ownership to wp
   sudo chgrp -R wp mysite
   # give group write permissions on everything
   sudo chmod -R g+w mysite
   # add the daemon user, which runs the webserver, to wp*
   sudo dscl . -append /groups/wp GroupMembership daemon
   ```
   <img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/enable-asset-upload-03.png" />

## Making your site static

Because Cloudsite works with primarily [static sites](/docs/user-guides/static-websites), we now need to take our dynamic WordPress site and generate a static snapshot which cloudsite can use. To do this, we add the 'Simply Static' plugin to our WordPress site and then use that generate the static files. To do this:

1. Go to the WP admin portal we opened earlier (at: `/localhost/mysite/wp-admin` in case you've lost the tab).
2. Click 'Plugins' → 'Add New Plugin'.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/simply-static-install-01.png" />
3. Search for 'Simply Static' and click 'Install Now'.2. Click 'Plugins' → 'Add New Plugin'.<br /><img style={{maxHeight: '240px'}} src="/img/docs/user-guides/website-development/build-with-wordpress/simply-static-install-02.png" />
4. Click 'Activate'.

You may need to refresh the WP admin page, but you should now see the 'Simply Static' control in the left hand menu.

Now, to generate the site, create a directory for the site content. Then:

1. Click 'Simply Static' → 'Settings'.
2. Ensure the 'Replacing URLs' is set to 'Relative Path' and check 'Force URL Replacement'.
3. Click 'Deploy' under 'Settings' in the left-hand Simply Static menu.
4. Change 'Deployment Method' to 'Local Directory'.[^1]
5. Under 'Path' enter the directory you just created where you want the static files to go and enable 'Clear Local Directory'.
6. Click 'Save Settings'.
7. Now (and in the future) you just have to click 'Generate Static Files' and the static site will be generated in the indicated folder.

[^1]: Depending on your target host, you may want to leave the 'Deployment Method' as 'ZIP Archive', if using CloudFlare Pages for instance.

## Deploying your site

Now that you have your static files, you have a ton of options of where and how to deploy your site. We go over deploying your site on AWS with the CloudFront CDN (including support for contact forms) using the CloudSite tool in Managing Your Website with Cloudsite. Because of the AWS free tier, this option would be free for many users, unless your site gets significant traffic, in which case it would probably be one of the more cost effective options.
WordPress vs Docusaurus
If the above setup seems daunting, we have a companion article in this series: Manage a Static Website with Docusaurus. Docusaurus is purpose built for static sites and so is a lot simpler to setup. Docusaurus comes out of the box with full support for blogs and a "knowledge base", with articles arbitrarily nested in topics and subtopics and would be perfect for a wiki style or topic based sites.
Docusaurus lacks the rich ecosystem of themes, however, so you'd need to either have some understanding of web design or hire a designer. Docusaurus works with plain HTML/CSS/Javascript (plus support for React components), whereas WP styling adds it's own concepts and peculiarities. So depending on one's experience, designing for Docusaurus may be more straightforward and flexible.
If you're coming in fresh-without much experience in web pages-it's hard to say which of the two has a steeper learning curve overall. WP has a clickety-click portal interface, but is overal more complex, IMO. Docusaurus is well suited for many use cases, but doesn't have the plethora of themes and plugins and requires someone with design experience. On the other hand, Docusaurus is ultimately more flexible and if you do have experience with HTML/CSS, may be the better option.
WP pros and cons:

+------------------------------------+---------------------------------------------+
|              WP pros               |                    Cons                     |
+------------------------------------+---------------------------------------------+
| Ready made themes                  | Custom design requires WP experience        |
| Tons of plugins                    | Plugin interactions potentially complicated |
| Web based interface                | Complicated setup                           |
| Good for blogs                     | Full backup can get complicated             |
| Good for wikis (w/plugins)         |                                             |
| Good for knowledgebase (w/plugins) |                                             |
| Good for galleries (w/plugins)     |                                             |
+------------------------------------+---------------------------------------------+
Docusaurus pros and cons:
+-------------------------------+----------------------------------------+
|        Docusaurus pros        |                  Cons                  |
+-------------------------------+----------------------------------------+
| Customizable w/basic HTML/CSS | Lacks theme ecosystem                  |
| Supports React components     | Lacks plugin ecosystem                 |
| Simple setup                  | File based interface (Markdown)        |
| Backups are simple            | Galleries require thought/organization |
| Good for blogs                |                                        |
| Good for wikis                |                                        |
| Good for knowledgebase        |                                        |
+-------------------------------+----------------------------------------+
In closing
The WordPress ecosystem includes a ton of free and premium themes, support for blogs, galleries, and tons of other features. It can get a little complex but overall, it's a great option to create a professional looking website for free on your own (or with minimal help).