# Styling & Behavior

The visual design (styling) and the interaction design (behavior) of the Intershop Progressive Web App is derived from the Responsive Starter Store with some changes (e.g., the header) to improve and modernize the customer experience and to provide an easy optical distinction between the two Intershop storefronts. While the Responsive Starter Store is based on a customized/themed [Bootstrap 3](https://getbootstrap.com/docs/3.3/), the Intershop Progressive Web App styling was migrated to build upon the current version of [Bootstrap 4](https://getbootstrap.com/). This also means that the Intershop Progressive Web App styling is now based on [Sass](http://sass-lang.com/).

## Bootstrap Integration

The styling integration is configured in the _/src/themes/main.scss_ of the project where Bootstrap together with the customizations is configured.

Instead of the Bootstrap 3 Glyphicons the current styling uses free solid icons of [Font Awesome](https://fontawesome.com/).

The styling itself is integrated into the project as global style via a _style.scss_ that is referenced in the _angular.json_ and is compiled automatically (see also [Chapter Multitheming](#multitheming)). Throughout the whole Intershop Progressive Web App, there are almost no component specific `styleUrls` or `styles` properties.

The [Javascript part of Bootstrap](http://getbootstrap.com/javascript/) for the behavior is not directly used from the Bootstrap dependency since this implementation is jQuery based and not really suited to work in an Angular environment. For Bootstrap 4, [ng-bootstrap](https://ng-bootstrap.github.io) provides _Bootstrap widgets the angular way_. Using these components works best with the styling taken from the Responsive Starter Store. However, the generation and structure of the HTML for the Angular Bootstrap differs from the HTML working with the original jQuery based _bootstrap.js_. Adaptions and changes in this area are inevitable.

## Assets

The assets folder is the place for any static resources like images, colors, etc., that are used by the storefront styling.

## Fonts

Currently the default font families for the Intershop Progressive Web App [Roboto](https://www.google.com/fonts/specimen/Roboto) and [Roboto Condensed](https://www.google.com/fonts/specimen/Roboto+Condensed) defined as npm dependency.

## Multitheming

It is possible to create multiple themes for styling. The Intershop Progressive Web App currently uses multi-theming to provide different styles for the B2C an the B2B application. The styles for B2C are defined in _/src/styles/themes/default/style.scss_, for B2B in _/src/themes/styles/blue/style.scss_.

Using schematics to start customizing Intershop Progressive Web App prepares a theme for your own custom styling. (See [Customizations - Start Customization](customizations.md#start-customization))

You can also manually prepare a new theme:

1. Create a custom theme folder (named _custom_) under _/src/themes/styles/_ with a copy of _styles.scss_ and _variables.scss_ from an available theme.

2. Reference the styling theme in the _angular.json_, so that the theme bundle will be extracted during the compiling process

   ```json
   ...
   "styles": [
     ...
     {
       "input": "src/styles/themes/custom/style.scss",
       "lazy": true,
       "bundleName": "custom"
     },
     ...
   ]
   ...
   ```

3. Set the theme to be used in your application settings in the _environment.ts_

```typescript
export const environment: Environment = {
  ...
  theme: 'custom',
};
```