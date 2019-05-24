/*
 * Copyright 2014-2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import sbaConfig from '@/sba-config'
import {bufferTime, filter, Subject} from '@/utils/rxjs';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';

let granted = false;

const requestPermissions = async () => {
  if ('Notification' in window) {
    granted = (window.Notification.permission === 'granted');
    if (!granted && window.Notification.permission !== 'denied') {
      const permission = await window.Notification.requestPermission();
      granted = permission === 'granted';
    }
  }
};

const notifyForSingleChange = (application, oldApplication) => {
  return createNotification(`${application.name} 状态变更为 ${application.status}`, {
    tag: `${application.name}-${application.status}`,
    lang: 'en',
    body: `以前为 ${oldApplication.status}.`,
    icon: application.status === 'UP' ? sbaConfig.uiSettings.favicon : sbaConfig.uiSettings.faviconDanger,
    renotify: true,
    timeout: 5000
  });
};

const notifyForBulkChange = ({count, status, oldStatus}) => {
  return createNotification(`${count} 个服务现在 ${status}`, {
    lang: 'en',
    body: `以前为 ${oldStatus}.`,
    icon: status === 'UP' ? sbaConfig.uiSettings.favicon : sbaConfig.uiSettings.faviconDanger,
    timeout: 5000
  });
};

const createNotification = (title, options) => {
  if (granted) {
    const notification = new window.Notification(title, options);
    if (options.url !== null) {
      notification.onclick = () => {
        window.focus();
        window.open(options.url, '_self');
      };
    }
    if (options.timeout > 0) {
      notification.onshow = () => setTimeout(() => notification.close(), options.timeout);
    }
  }
};


export default {
  install: ({applicationStore}) => {
    requestPermissions();

    const queue = new Subject();
    queue.pipe(
      bufferTime(1000),
      filter(n => n.length > 0)
    ).subscribe({
      next: events => {
        const groupedByChange = groupBy(events, event => `${event.oldApplication.status}-${event.application.status}`);
        for (const eventsPerChange of values(groupedByChange)) {
          if (eventsPerChange.length <= 5) {
            eventsPerChange.forEach(event => {
              notifyForSingleChange(event.application, event.oldApplication);
            })
          } else {
            notifyForBulkChange({
              status: eventsPerChange[0].application.status,
              oldStatus: eventsPerChange[0].oldApplication.status,
              count: events.length
            })
          }
        }
      }
    });

    applicationStore.addEventListener('updated', (application, oldApplication) => {
      if (application.status !== oldApplication.status) {
        queue.next({application, oldApplication});
      }
    });
  }
}
