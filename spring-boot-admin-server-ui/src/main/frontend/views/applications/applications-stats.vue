<!--
  - Copyright 2014-2018 the original author or authors.
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -     http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -->

<template>
  <div class="level">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">
          监控服务数
        </p>
        <p class="title" v-text="applicationsCount">
          1
        </p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">
          监控服务实例数
        </p>
        <p class="title" v-text="instancesCount">
          1
        </p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div v-if="downCount === 0">
        <p class="heading">
          状态
        </p>
        <p class="title has-text-success">
          全部正常运行
        </p>
      </div>
      <div v-else>
        <p class="heading">
          存在实例错误
        </p>
        <p class="title has-text-danger" v-text="downCount" />
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      applications: {
        type: Array,
        default: () => [],
      }
    },
    computed: {
      applicationsCount() {
        return this.applications.length;
      },
      instancesCount() {
        return this.applications.reduce((current, next) => current + next.instances.length, 0);
      },
      downCount() {
        return this.applications.reduce((current, next) => {
          return current + (next.instances.filter(instance => instance.statusInfo.status !== 'UP').length);
        }, 0);
      }
    }
  }
</script>
