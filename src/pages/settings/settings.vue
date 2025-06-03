<template>
    <LmContainer>
      <Row>
        <div>
          <h1>Settings</h1>
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
              <h3>Card 2</h3>
            </div>
            <div class="lm-card-body">
              <p>This is card content.</p>
              <PopOverHover />
            </div>
          </div>
        </Col>
        <Col :xs="12" :sm="6" :md="4" :lg="3">
          <div class="lm-card">
            <div class="lm-card-header">
              <h3>Card 3</h3>
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
      <Row :gap="'1.5rem'">
        <Col :xs="12" :sm="6" :md="4" :lg="3">
          <LmCard>
            <template #header>
              <h3>Card 1</h3>
            </template>
            <template #body>
              <p>This is card content.</p>
            </template>
          </LmCard>
        </Col>
        <Col :xs="12" :sm="6" :md="4" :lg="3">
          <LmCard>
            <template #header>
              <h3>Card 2</h3>
            </template>
            <template #body>
              <p>This is card content.</p>
            </template>
          </LmCard>
        </Col>
        <Col :xs="12" :sm="6" :md="4" :lg="3">
          <LmCard>
            <template #header>
              <h3>Card 3</h3>
            </template>
            <template #body>
              <p>This is card content.</p>
            </template>
          </LmCard>
        </Col>
        <Col :xs="12" :sm="6" :md="4" :lg="3">
          <LmCard>
            <template #header>
              <h3>Card 4</h3>
            </template>
            <template #body>
              <p>This is card content.</p>
            </template>
          </LmCard>
        </Col>
        <Col :xs="12" :sm="6" :md="4" :lg="3">
          <LmCard>
            <template #header>
              <h3>Card 1</h3>
            </template>
            <template #body>
              <p>This is card content.</p>
            </template>
          </LmCard>
        </Col>
        <Col :xs="12" :sm="6" :md="4" :lg="3">
          <LmCard>
            <template #header>
              <h3>Card 2</h3>
            </template>
            <template #body>
              <p>This is card content.</p>
            </template>
          </LmCard>
        </Col>
        <Col :xs="12" :sm="6" :md="4" :lg="3">
          <LmCard>
            <template #header>
              <h3>Card 3</h3>
            </template>
            <template #body>
              <p>This is card content.</p>
            </template>
          </LmCard>
        </Col>
        <Col :xs="12" :sm="6" :md="4" :lg="3">
          <LmCard>
            <template #header>
              <h3>Card 4</h3>
            </template>
            <template #body>
              <p>This is card content.</p>
            </template>
          </LmCard>
        </Col>
      </Row>
    </LmContainer>
  </template>
  
  <script setup>
  import LmCard from "../../components/cards/card.vue";
  import LmContainer from "../../components/container/lm-container.vue";
  import Row from "../../components/container/row.vue";
  import Col from "../../components/container/col.vue";
  import PopOverTest from "../../components/popover/pop-over-test.vue";
  import PopOverHover from "../../components/popover/pop-over-hover.vue";
  import getGoogleOAuthUrl from "../../generate-google-oauth-link";
  </script>
  
  
  
