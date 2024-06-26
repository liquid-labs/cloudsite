---
sidebar_position: 2
description: A rundown on building websites with Docusaurus.
---
# Build with Docusaurus

Docusaurus is an easy to use website building framework with built-in support for blogs and wikis/document trees/knowledgebases. Because Docusaurus works with plain HTML and [Markdown](https://www.markdownguide.org/) files, it's a breeze to setup and get going. Docusaurus also supports React components out of the box.

Note in this article, `~` is shorthand for "the local folder where you installed the Docusaurus site".

## Set up Docusaurus

First, you must have Node+NPM on your system. If you need help checking for and/or installing Node+NPM, refer to the [Node and NPM section of the getting started installation guide](/docs/get-started/installation#node-and-npm).

Once Node+NPM are installed, open a [terminal](/docs/get-started/installation#terminal-commands) and type:

```bash
npx create-docusaurus@latest ./my-site classic
```

Where `./my-site` is the folder where Docusaurus will be set up.

That's it, Docusaurus is now installed. To view the site, simply cd into the Docusaurus site folder and start the local server:

```bash
cd ./my-site
npm start
```

This should automatically open the initial site in your web browser. If it doesn't, simply point your browser to `http://localhost:3000`. The initial site is itself a quick tutorial on Docusaurus.

## Manage look and feel

Docusaurus does not currently have any themes beyond the 'classic' theme,[^1] and in general you have to mess with the CSS (by modifying `~/src/css/custom.css`) and HTML in order to fully style Docusaurus.

[^1]: There are some additional packages which are called 'themes' that you may see referred to in the documentation. These are really just plugins, however, and not "look and feel" themes. The Docusaurus team notes that adding full fledged themes is a goal.

### Set your logo

1. Place your logo in the `~/static/img` folder.
2. Open `~/docusaurus.config.js` and search for 'themeConfig'.
3. Find the `themeConfig.navbar.logo` entry.
4. Set the `src` field to `/img/your-logo-source.svg` (_without_ the 'static' prefix).

SVG files are best though any image file (SVG, PNG, JPG) should work.

You can set a 'dark theme' version of the logo (if different), by following the same steps, except you set the `srcDark` field. If you don't set a dark theme logo, the same logo will be used for both dark and light themes.

### Disabling the 'light/dark' toggle

1. Open `~/docusaurus.config.js`.
2. Search for 'themeConfig'.
3. Under `themeConfig.colorMode`, update or add the field: `disableSwitch: true`.

You can also set the default (or single) theme in the same section.

### Setting colors and fonts

The classic Docusaurus theme is based on a single color with three lighter shades and three darker shades of the same color. You can calculate these yourself using [a color picker tool like this one](https://redketchup.io/color-picker), and then set the RGB hex codes directly in the src/css/custom.css file by just replacing the existing entries. All the colors are based on the variables `--ifm-color-primary`, `--ifm-color-primary-dark`, `--ifm-color-primary-light`, etc.

If you want to get a little fancier, you can create variables for the hue, saturation, and lightness of your primary color and then generate the darker and lighter shades by manipulating the lightness directly like this:

```css
:root { /* this is Liquid Labs blue, #21327d */
  --ll-color-primary-hue: 229;
  --ll-color-primary-saturation: 58%;
  --ll-color-primary-lightness: 31%;
  /* this is the var used in the theme for the primary color */
  --ifm-color-primary: hsl(
    var(--ll-color-primary-hue), 
    var(--ll-color-primary-saturation), 
    var(--ll-color-primary-lightness)
  );
  --ifm-color-primary-darkest: hsl(
    var(--ll-color-primary-hue), 
    var(--ll-color-primary-saturation), 
    5%
  );
  /* etc. */
}
```

You can use the [a color picker](https://redketchup.io/color-picker) to translate from RGB to HSL color specs as well.

Similar to set the fonts, set the variables `--ifm-font-family-base` and `--ifm-heading-font-family`. Don't forget to list out fallback fonts.

## Managing content

Here we provide instructions on how to perform some common activities. For further instructions and details, refer to the [Docusaurus documentation](https://docusaurus.io/docs).

### Blog posts

#### Defining your authors

Before you make your first entry, it's useful to define `~/blog/authors.yml`. This sets up the biographical data of post authors that is used to generate the post entry. This only needs to be done once and updated only when new authors are added or biographical data needs to be changed.

Create an `authors.yml` file in the `~/blog` folder like:
 ```yaml
 author-user-name:
   name: Author Name # required
   title: Founder #optional
   url: https://authors-website.com # optional
   image_url: https://url-to-avatar/image.png # optional
 ```
 As an example, here is the `authors.yml` file for this site:

 ```yaml
zane:
  name: Zane Rockenbaugh
  title: Cloudsite Creator
  url: https://liquid-labs.com
  image_url: https://github.com/zanerock.png
```

#### A simple post

1. Create a new text file named like `YYYY-MM-DD-the-blog-entry-title.md` in the `~/blog` folder.
2. Add front matter meta-data at the top of the file like:
   ```markdown
   ---
   authors: [zane]
   title: Cloudsite 1.0.0-beta.2 Released
   slug: cloudsite-1.0.0-beta.2-released
   ---
   ```
   Where `authors` references the author user name in the `authors.yml` file, `title` is the title of the post, and `slug` is the URL fragment for the page; e.g.: `https://your-site.com/blog/this-is-the-slug`.
3. Write the post content.

#### A post with images or other content

To include images or other content in your blog post, create a folder like `~/blog/YYYY-MM-DD-the-blog-entry-title` instead of a file. Create an `index.md` file in that folder where create the blog post as above. You can then add any images or other content in that folder.

You can then reference images (or other content) like:
<div class="flow-list">
- `![alt text](./foo.png)` (Markdown image format) or 
- `<img src="./foo.png" alt="alt text" />` (HTML format).
</div>

The two methods are essentially equivalent, except the latter allows you to add additional properties and styling if you're familiar with HTML. Notice the '.' in the file path. In this context, '.' means 'the current folder', so we're saying, "look for the image in the folder where this file resides."

#### Update a post

Just open the blog post file (like `~/blog/2024-01-01-blog-entry.md` or `~/blog/2024-01-01-blog-entry/index.md`) and make your changes.

#### Remove the blog

If you don't want a blog as part of your site:

1. Delete the `~/blog` folder.
2. Open `~/docusaurus.config.js`.
3. Search for 'presets' and delete the `blog` entry.
4. In the `themeConfig.navbar.items` section, delete the 'Blog' entry in the navigation bar configuration by searching for 'Blog' and deleting the entry. It should look something like:
```
{to: '/blog', label: 'Blog', position: 'left'},
```

#### Additional blog details and options

For additional details and options, refer to the [Docusaurus blog documentation](https://docusaurus.io/docs/blog).

### Add wiki/knowledgebase documents

When you set up your Docusaurus site, you'll see a `~/docs` folder. The initial site is configured to generate a document tree based on the contents of this folder. This is perfect for creating a wiki, knowledge base, product documentation, or categorized content in general.

#### Add a category

1. You can add a category by creating a new folder in the `~/docs` folder; e.g. `~/docs/a-new-category`.
2. Create a `_category_.yml` file in the newly created folder and enter the category meta-data like:
   ```yaml
   label: Website development
   position: 3
   link:
     type: generated-index
     description: Guides on developing static websites from scratch and using various platforms.
   ```
   Where `label` is the label that will be displayed in the document tree sidebar, `position` is the position of the category vis-a-vis sibling categories and pages, and `link.description` will be displayed in the parent category summary.

You can nest categories as much as you like.

#### Add a document

1. Create a document file in the `~/docs` folder or the appropriate category folder named like `document-title.md`.
2. Add front matter meta-data at the top of the file like:
   ```
   ----
   position: 1
   description: Description to displayed in parent category summary.
   ----
   ```
3. Write out the document in Markdown format.

Note, the title of the document (e.g.: `# This is a title in Markdown`) will be used as the title in the document tree navigation.

#### Include images or other content

For documents, you have to place your images or other assets in the `~/static` folder. These are then referenced from your documents without the `~/static` prefix. So `~/static/img/foo.png` would be referenced like `![alt text](/img/foo.png)` (Markdown image format) or `<img src="/img/foo.png" alt="alt text" />` (HTML format).

You can create other sub-folders under `~/static` like `~/static/videos`, `~/static/audio`, etc. Note that Docusaurus doesn't care what these directories are called and you can organize them by document as well, so if you have lots of documents with lots of images, you might want to do something like `~/static/docs/my-doc-1`, `~/static/docs/some-category/another-doc`, etc.

#### Update documents

- To update a document, simply update the document text file contents.
- You can also move and rearrange files and folders.
- To change a document or category name, or to re-order the displayed listing, update the metadata in the `_category_.yml` file for folder/categories and the front matter at the top of a text file for documents.

#### Removing documents

Simply delete documents and categories. 

#### Removing docs altogether:
To remove the a wiki/documentation tree/knowledgebase entirely:

1. Delete the `~/docs` directory.
2. Open `~/docusaurus.config.js`.
3. Search for 'presets' and delete the `docs` entry.
4. Search for 'themeConfig' and delete the `docs` entry.
5. In the `themeConfig.navbar.items` section, find the entry for the docs menu item (by default, the `label` entry is 'Docs'), and delete it.

#### Additional docs details and options

For additional details and options, refer to the [Docusaurus docs documentation](https://docusaurus.io/docs/docs-introduction).

## Test your site

To view your site locally and test it, [open a terminal](/docs/get-started/installation#terminal-commands) and change your working directory to your Docusaurus installation (e.g.: `cd ./my-site`). Then execute:
```bash
npm start # or npx docusaurus start
```

## Deploy your site

To deploy your site using cloudsite for the first time, [open a terminal](/docs/get-started/installation#terminal-commands) and execute:
```bash
aws sso login --profile cloudsite-manager # if necessary
cloudsite create your-domain.com --source-path ./path/were/static/files/went
```

To update an existing site, [open a terminal](/docs/get-started/installation#terminal-commands) and execute:
```bash
aws sso login --profile cloudsite-manager # if necessary
cloudsite update your-domain.com --do-content
```

With Docusaurus based sites, Cloudsite automatically generates the static site files for you.

## Get help

Check out the full Docusaurus documentaiton and community links at [docusaurus.io](https://docusaurus.io).

You can post design questions (separate from implementaiton) on the user experience StackExchange: [ux.stackexchange.com](https://ux.stackexchange.com). For more technical questions regarding CSS, HTML , Javascript, and Docusaurus itself, you can post to [StackOverflow](https://stackoverflow.com). Finally, for search engine optimization (SEO) and non-development technical questions, there's also the webmaster StackExchange: [webmasters.stackexchange.com](https://webmaster.stackexchange.com).

In addition, Cloudsite users can get [unlimited, affordable, personalized website consultation](/support#unlimited-website-consultation) offered through [Liquid Labs](https://liquid-labs.com). We'll walk you through setup, explain concepts, provide advice, and answer any question you might have regarding design, feature implementation, and operations.

## In closing

Docusaurus is simple to setup and you can easily create documentation, blogs, marketing sites, etc. It comes with a simple, single-color theme that's easy to tweak. It does require knowledge of HTML+CSS to fully style, though with the free resources and [Cloudsite website support](/support), you can get instructions, examples, or even code to accomplish most styling goals.
