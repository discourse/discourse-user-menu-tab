import Component from "@glimmer/component";
import { service } from "@ember/service";
import $ from "jquery";
import DButton from "discourse/components/d-button";

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

export default class UserMenuCustomTab extends Component {
  @service currentUser;

  get items() {
    const items = [];
    const currentUserGroups = this.currentUser.groups.map((x) =>
      x["name"].toLowerCase()
    );

    this.#defaultItems.forEach((button) => {
      if (button.content !== undefined) {
        if (
          !this.currentUser.admin &&
          button.groups &&
          !currentUserGroups.some((r) => button.groups.includes(r))
        ) {
          return;
        }

        items.push(button);
      }
    });

    this.#modButtons?.forEach((button) => {
      if (button.content !== undefined) {
        items.push(button);
      }
    });

    this.#adminButtons?.forEach((button) => {
      if (button.content !== undefined) {
        items.push(button);
      }
    });

    return items;
  }

  get #defaultItems() {
    return parseTabSettings(settings.custom_tab_links);
  }

  get #modButtons() {
    if (this.currentUser.moderator) {
      return parseTabSettings(settings.moderator_only_tab_links);
    }
  }

  get #adminButtons() {
    if (this.currentUser.admin) {
      return parseTabSettings(settings.admin_only_tab_links);
    }
  }

  <template>
    <ul class="user-menu-custom-tab">
      {{#each this.items as |item|}}
        <li>
          <DButton
            class="btn-flat"
            @href={{item.href}}
            @icon={{item.icon}}
            @translatedLabel={{item.content}}
          />
        </li>
      {{/each}}
    </ul>
  </template>
}
