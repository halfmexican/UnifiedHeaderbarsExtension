const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

class Extension {
  constructor() {
    this.gtk4ConfigDir = GLib.build_filenamev([GLib.get_home_dir(), '.config', 'gtk-4.0']);
    this.gtk4CssPath = GLib.build_filenamev([this.gtk4ConfigDir, 'gtk.css']);
    this.gtk3ConfigDir = GLib.build_filenamev([GLib.get_home_dir(), '.config', 'gtk-3.0']);
    this.gtk3CssPath = GLib.build_filenamev([this.gtk3ConfigDir, 'gtk.css']);
  }

  // Helper function to handle file operations
  handleCssFile(configDir, cssPath, ruleToAdd, ruleToRemove) {
    if (!GLib.file_test(configDir, GLib.FileTest.EXISTS)) {
      GLib.mkdir_with_parents(configDir, 0o755);
    }

    let cssContent = '';
    if (GLib.file_test(cssPath, GLib.FileTest.EXISTS)) {
      cssContent = GLib.file_get_contents(cssPath)[1].toString();
    }

    if (!cssContent.includes(ruleToAdd)) {
      cssContent += `\n${ruleToAdd}\n`;
      GLib.file_set_contents(cssPath, cssContent);
    }

    return () => {
      if (GLib.file_test(cssPath, GLib.FileTest.EXISTS)) {
        cssContent = GLib.file_get_contents(cssPath)[1].toString();
        cssContent = cssContent.replace(ruleToRemove, '');
        GLib.file_set_contents(cssPath, cssContent);
      }
    };
  }

  enable() {
    const gtk4Rule = '.csd headerbar {\n  min-height: 47px;\n}';
    this.disableGtk4 = this.handleCssFile(this.gtk4ConfigDir, this.gtk4CssPath, gtk4Rule, gtk4Rule);

    const gtk3Rule = '.ssd titlebar {\n  min-height: 47px;\n}';
    this.disableGtk3 = this.handleCssFile(this.gtk3ConfigDir, this.gtk3CssPath, gtk3Rule, gtk3Rule);
  }

  disable() {
    if (this.disableGtk4) {
      this.disableGtk4();
    }

    if (this.disableGtk3) {
      this.disableGtk3();
    }
  }
}

function init() {
  return new Extension();
}

