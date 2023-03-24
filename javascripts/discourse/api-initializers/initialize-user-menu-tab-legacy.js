import { apiInitializer } from "discourse/lib/api";
import { createWidgetFrom, queryRegistry } from "discourse/widgets/widget";
import I18n from "I18n";

/**
 * This file is safe to delete once core has removed the legacy user menu
 */

function parseTabSettings(settings) {
  return settings.split("|").map((i) => {
    const seg = $.map(i.split(","), $.trim),
      icon = seg[0],
      content = seg[1],
      href = seg[2],
      groups = seg[3]
        ? seg[3].split("-").map((group) => group.trim().toLowerCase())
        : null;
    return { icon, content, href, groups };
  });
}

export default apiInitializer("0.8", (api) => {
  I18n.translations.en.js.tab_title = I18n.t(
    themePrefix("custom_user_tab_title")
  );

  api.addUserMenuGlyph(() => {
    const glyph = {
      title: "tab_title",
      className: "custom",
      icon: settings.custom_tab_icon,
    };

    if (queryRegistry("quick-access-panel")) {
      glyph["action"] = "quickAccess";
      glyph["actionParam"] = "custom";
      glyph["data"] = { url: settings.custom_tab_url };
    }

    return glyph;
  });

  const QuickAccessPanel = queryRegistry("quick-access-panel");
  const currentUser = api.getCurrentUser();

  if (QuickAccessPanel) {
    createWidgetFrom(QuickAccessPanel, "quick-access-custom", {
      tagName: "div.quick-access-panel.quick-access-custom",
      buildKey: () => "quick-access-custom",

      hideBottomItems() {
        return true;
      },

      findNewItems() {
        return Promise.resolve(this._getItems());
      },

      itemHtml(item) {
        const widgetType = item.widget || "quick-access-item";
        return this.attach(widgetType, item);
      },

      _getItems() {
        const items = [];
        const currentUserGroups = currentUser.groups.map((x) =>
          x["name"].toLowerCase()
        );

        if (this._getDefaultItems()) {
          this._getDefaultItems().forEach((button) => {
            if (button.content !== undefined) {
              if (
                !currentUser.admin &&
                button.groups &&
                !currentUserGroups.some((r) => button.groups.includes(r))
              ) {
                return;
              }

              items.push(button);
            }
          });
        }

        if (this._modButtons()) {
          this._modButtons().forEach((button) => {
            if (button.content !== undefined) {
              items.push(button);
            }
          });
        }

        if (this._adminButtons()) {
          this._adminButtons().forEach((button) => {
            if (button.content !== undefined) {
              items.push(button);
            }
          });
        }
        return items;
      },

      _getDefaultItems() {
        return parseTabSettings(settings.custom_tab_links);
      },

      _modButtons() {
        if (this.currentUser.moderator) {
          return parseTabSettings(settings.moderator_only_tab_links);
        }
      },

      _adminButtons() {
        if (this.currentUser.admin) {
          return parseTabSettings(settings.admin_only_tab_links);
        }
      },
    });
  }
});
