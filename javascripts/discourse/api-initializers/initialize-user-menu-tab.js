import { apiInitializer } from "discourse/lib/api";
import I18n from "I18n";
import UserMenuCustomTab from "../components/user-menu/custom-tab";

export default apiInitializer("0.8", (api) => {
  api.registerUserMenuTab((UserMenuTab) => {
    return class extends UserMenuTab {
      id = "user-menu-tab-custom";
      panelComponent = UserMenuCustomTab;
      icon = settings.custom_tab_icon;
      linkWhenActive = settings.custom_tab_url;

      get title() {
        return I18n.t(themePrefix("custom_user_tab_title"));
      }
    };
  });
});
