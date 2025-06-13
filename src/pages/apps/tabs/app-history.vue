<template>
  <div class="app-history">
    <Row :gap="'1.5rem'">
      <Col :xs="12">
        <LmCard>
          <template #header>
            <div class="history-header">
              <span class="material-symbols-outlined">account_tree</span>
              <h3>Development Timeline</h3>
              <div class="branch-legend">
                <div class="legend-item">
                  <div class="branch-color main"></div>
                  <span>main</span>
                </div>
                <div class="legend-item">
                  <div class="branch-color feature"></div>
                  <span>feature</span>
                </div>
                <div class="legend-item">
                  <div class="branch-color hotfix"></div>
                  <span>hotfix</span>
                </div>
              </div>
            </div>
          </template>
          <template #body>
            <div class="git-timeline">
              <svg class="timeline-svg" :width="svgWidth" :height="svgHeight">
                <!-- Branch lines -->
                <g class="branch-lines">
                  <path 
                    v-for="line in branchLines" 
                    :key="line.id"
                    :d="line.path"
                    :class="`branch-line ${line.branch}`"
                    fill="none"
                    stroke-width="3"
                  />
                </g>
              </svg>
              
              <!-- Commits -->
              <div 
                v-for="commit in commits" 
                :key="commit.id"
                class="commit-item"
                :style="getCommitPosition(commit)"
              >
                <div class="commit-node" :class="commit.branch">
                  <span class="material-symbols-outlined">{{ commit.icon }}</span>
                </div>
                <div class="commit-content">
                  <div class="commit-header">
                    <h4>{{ commit.message }}</h4>
                    <div class="commit-meta">
                      <span class="commit-hash">{{ commit.hash }}</span>
                      <span class="commit-branch">{{ commit.branch }}</span>
                      <span class="commit-date">{{ formatDate(commit.date) }}</span>
                    </div>
                  </div>
                  <p class="commit-description">{{ commit.description }}</p>
                  <div v-if="commit.changes" class="commit-changes">
                    <span 
                      v-for="change in commit.changes" 
                      :key="change.type"
                      :class="`change-stat ${change.type}`"
                    >
                      {{ change.count }} {{ change.type }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </LmCard>
      </Col>
    </Row>
  </div>
</template>

<script setup>
import LmCard from "../../../components/cards/card.vue";
import Row from "../../../components/container/row.vue";
import Col from "../../../components/container/col.vue";
import { inject, ref, computed } from 'vue'

const app = inject('app')

const svgWidth = 120
const svgHeight = 800

// Enhanced commit data with branching information
const commits = ref([
  {
    id: 'c1',
    hash: 'a1b2c3d',
    message: 'Initial commit',
    description: 'Set up project structure and basic configuration',
    branch: 'main',
    date: new Date('2024-01-15T09:00:00'),
    icon: 'add_circle',
    position: { x: 60, y: 50 },
    changes: [
      { type: 'added', count: 15 },
      { type: 'modified', count: 0 },
      { type: 'deleted', count: 0 }
    ]
  },
  {
    id: 'c2',
    hash: 'e4f5g6h',
    message: 'Add authentication system',
    description: 'Implemented user login and registration functionality',
    branch: 'main',
    date: new Date('2024-01-18T14:30:00'),
    icon: 'security',
    position: { x: 60, y: 150 },
    changes: [
      { type: 'added', count: 8 },
      { type: 'modified', count: 3 },
      { type: 'deleted', count: 1 }
    ]
  },
  {
    id: 'c3',
    hash: 'i7j8k9l',
    message: 'Start feature/dashboard',
    description: 'Begin development of dashboard components',
    branch: 'feature',
    date: new Date('2024-01-20T10:15:00'),
    icon: 'call_split',
    position: { x: 30, y: 250 },
    changes: [
      { type: 'added', count: 5 },
      { type: 'modified', count: 2 },
      { type: 'deleted', count: 0 }
    ]
  },
  {
    id: 'c4',
    hash: 'm1n2o3p',
    message: 'Update API endpoints',
    description: 'Refactored API structure for better performance',
    branch: 'main',
    date: new Date('2024-01-22T11:45:00'),
    icon: 'api',
    position: { x: 60, y: 280 },
    changes: [
      { type: 'added', count: 2 },
      { type: 'modified', count: 12 },
      { type: 'deleted', count: 3 }
    ]
  },
  {
    id: 'c5',
    hash: 'q4r5s6t',
    message: 'Complete dashboard widgets',
    description: 'Added charts, metrics, and interactive components',
    branch: 'feature',
    date: new Date('2024-01-25T16:20:00'),
    icon: 'dashboard',
    position: { x: 30, y: 380 },
    changes: [
      { type: 'added', count: 18 },
      { type: 'modified', count: 7 },
      { type: 'deleted', count: 2 }
    ]
  },
  {
    id: 'c6',
    hash: 'u7v8w9x',
    message: 'Critical security patch',
    description: 'Fixed authentication vulnerability',
    branch: 'hotfix',
    date: new Date('2024-01-26T09:30:00'),
    icon: 'security',
    position: { x: 90, y: 420 },
    changes: [
      { type: 'added', count: 1 },
      { type: 'modified', count: 4 },
      { type: 'deleted', count: 0 }
    ]
  },
  {
    id: 'c7',
    hash: 'y1z2a3b',
    message: 'Merge feature/dashboard',
    description: 'Integrated dashboard functionality into main branch',
    branch: 'main',
    date: new Date('2024-01-28T13:10:00'),
    icon: 'merge_type',
    position: { x: 60, y: 480 },
    changes: [
      { type: 'added', count: 23 },
      { type: 'modified', count: 9 },
      { type: 'deleted', count: 2 }
    ]
  },
  {
    id: 'c8',
    hash: 'c4d5e6f',
    message: 'Release v1.2.0',
    description: 'Tagged stable release with new dashboard features',
    branch: 'main',
    date: new Date('2024-02-01T10:00:00'),
    icon: 'rocket_launch',
    position: { x: 60, y: 580 },
    changes: [
      { type: 'added', count: 1 },
      { type: 'modified', count: 2 },
      { type: 'deleted', count: 0 }
    ]
  }
])

// Generate SVG paths for branch lines
const branchLines = computed(() => {
  const lines = []
  
  // Main branch line
  lines.push({
    id: 'main-line',
    branch: 'main',
    path: `M 60 30 L 60 600`
  })
  
  // Feature branch - branch out and merge back
  lines.push({
    id: 'feature-branch',
    branch: 'feature',
    path: `M 60 200 Q 45 220 30 240 L 30 390 Q 45 460 60 480`
  })
  
  // Hotfix branch - quick branch and merge
  lines.push({
    id: 'hotfix-branch',
    branch: 'hotfix',
    path: `M 60 380 Q 75 400 90 420 Q 75 450 60 480`
  })
  
  return lines
})

const getCommitPosition = (commit) => {
  return {
    position: 'absolute',
    left: `${commit.position.x + 40}px`,
    top: `${commit.position.y}px`,
    transform: 'translateY(-50%)'
  }
}

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.history-header .material-symbols-outlined {
  color: var(--primary-500);
  margin-right: 0.5rem;
}

.branch-legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.branch-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.branch-color.main { background: #2563eb; }
.branch-color.feature { background: #059669; }
.branch-color.hotfix { background: #dc2626; }

.git-timeline {
  position: relative;
  min-height: 800px;
  padding: 20px 0;
}

.timeline-svg {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}

.branch-line.main { stroke: #2563eb; }
.branch-line.feature { stroke: #059669; }
.branch-line.hotfix { stroke: #dc2626; }

.commit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2;
  position: relative;
}

.commit-node {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid;
  background: white;
  position: relative;
  z-index: 3;
}

.commit-node.main { 
  border-color: #2563eb;
  color: #2563eb;
}

.commit-node.feature { 
  border-color: #059669;
  color: #059669;
}

.commit-node.hotfix { 
  border-color: #dc2626;
  color: #dc2626;
}

.commit-node .material-symbols-outlined {
  font-size: 1rem;
}

.commit-content {
  flex: 1;
  background: var(--surface);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--surface-variant);
  max-width: calc(100% - 200px);
}

.commit-header {
  margin-bottom: 0.5rem;
}

.commit-header h4 {
  margin: 0 0 0.25rem 0;
  color: var(--on-surface);
  font-size: 1rem;
}

.commit-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--on-surface-variant);
}

.commit-hash {
  font-family: 'Courier New', monospace;
  background: var(--surface-variant);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
}

.commit-branch {
  background: var(--primary-100);
  color: var(--primary-700);
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.commit-description {
  margin: 0.5rem 0;
  color: var(--on-surface-variant);
  font-size: 0.9rem;
}

.commit-changes {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.change-stat {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.change-stat.added {
  background: #dcfce7;
  color: #166534;
}

.change-stat.modified {
  background: #fef3c7;
  color: #92400e;
}

.change-stat.deleted {
  background: #fecaca;
  color: #991b1b;
}
</style> 