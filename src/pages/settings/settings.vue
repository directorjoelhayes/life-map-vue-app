<template>
  <LmContainer>
    <Row>
      <div>
        <h1>Settings</h1>
      </div>
    </Row>
    <Row>
      <div class="settings-header">
        <span class="material-symbols-outlined">person</span>
        <h2>Account Details</h2>
      </div>
    </Row>
    <Row :gap="'1.5rem'">
      <Col :xs="12" :sm="6" :md="4" :lg="3">
        <div class="lm-card" v-view-transition-name="'google-oauth-card'">
          <div class="lm-card-header">
            <h3>Google OAuth</h3>
          </div>
          <div class="lm-card-body">
            <a :href="getGoogleOAuthUrl()">Connect Google</a>
          </div>
        </div>
      </Col>
      <Col :xs="12" :sm="6" :md="4" :lg="3">
        <div class="lm-card" v-view-transition-name="'spotify-card'">
          <div class="lm-card-header">
            <h3>Spotify</h3>
          </div>
          <div class="lm-card-body">
            <p>This is card content.</p>
          </div>
        </div>
      </Col>
      <Col :xs="12" :sm="6" :md="4" :lg="3">
        <div class="lm-card" v-view-transition-name="'github-card'">
          <div class="lm-card-header">
            <h3>Github</h3>
          </div>
          <div class="lm-card-body">
            <p>This is card content.</p>
          </div>
        </div>
      </Col>
      <Col :xs="12" :sm="6" :md="4" :lg="3">
        <div class="lm-card">
          <div class="lm-card-header">
            <h3>Card 4</h3>
          </div>
          <div class="lm-card-body">
            <p>This is card content.</p>
          </div>
        </div>
      </Col>
    </Row>
    <Row>
      <div class="settings-header">
        <span class="material-symbols-outlined">security</span>
        <h2>Oauth / API Keys</h2>
      </div>
    </Row>
    <Row :gap="'1.5rem'">
      <Col :xs="12" :sm="6" :md="4" :lg="3">
        <div class="lm-card">
          <div class="lm-card-header">
            <h3>Google OAuth</h3>
          </div>
          <div class="lm-card-body">
            <a :href="getGoogleOAuthUrl()">Connect Google</a>
          </div>
        </div>
      </Col>
      <Col :xs="12" :sm="6" :md="4" :lg="3">
        <div class="lm-card">
          <div class="lm-card-header">
            <h3>Spotify</h3>
          </div>
          <div class="lm-card-body">
            <p>This is card content.</p>
          </div>
        </div>
      </Col>
      <Col :xs="12" :sm="6" :md="4" :lg="3">
        <div class="lm-card">
          <div class="lm-card-header">
            <h3>Github</h3>
          </div>
          <div class="lm-card-body">
            <p>This is card content.</p>
          </div>
        </div>
      </Col>
      <Col :xs="12" :sm="6" :md="4" :lg="3">
        <div class="lm-card">
          <div class="lm-card-header">
            <h3>Card 4</h3>
          </div>
          <div class="lm-card-body">
            <p>This is card content.</p>
          </div>
        </div>
      </Col>
    </Row>
    <device-list />
  </LmContainer>
</template>
  
  <script setup>
import LmContainer from "../../components/container/lm-container.vue";
import Row from "../../components/container/row.vue";
import Col from "../../components/container/col.vue";
import getGoogleOAuthUrl from "../../generate-google-oauth-link";
import DeviceList from "../../components/devices/device-list.vue";
</script>

<style>
.settings-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.settings-header span {
  color: var(--primary-400);
  text-shadow: 0px 2px 12px var(--primary-500);
}
</style>
  
  
  
