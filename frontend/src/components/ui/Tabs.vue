<template>
  <div class="tabs-container">
    <!-- Navigation tabs -->
    <div class="tabs-nav">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.key || index"
        @click="selectTab(tab, index)"
        :class="getTabClass(tab, index)"
        :disabled="tab.disabled"
      >
        <!-- Icon -->
        <component 
          v-if="tab.icon" 
          :is="tab.icon" 
          class="w-4 h-4 mr-2" 
        />
        
        <!-- Label -->
        {{ tab.label }}
        
        <!-- Badge count -->
        <Badge 
          v-if="tab.badge" 
          :variant="tab.badgeVariant || 'primary'" 
          size="small" 
          class="ml-2"
        >
          {{ tab.badge }}
        </Badge>
      </button>
    </div>

    <!-- Tab content -->
    <div class="tab-content">
      <Transition
        :name="transitionName"
        mode="out-in"
      >
        <div :key="activeTabKey" class="tab-panel">
          <!-- Slot dinámico por tab -->
          <slot 
            v-if="useSlots" 
            :name="activeTab.key || `tab-${activeIndex}`"
            :tab="activeTab"
            :index="activeIndex"
          />
          
          <!-- Contenido directo del tab -->
          <div v-else-if="activeTab.content" v-html="activeTab.content" />
          
          <!-- Slot por defecto -->
          <slot v-else />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Badge from './Badge.vue'

// Props
const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    validator: (tabs) => {
      return tabs.every(tab => tab.label)
    }
  },
  modelValue: {
    type: [String, Number],
    default: null
  },
  defaultTab: {
    type: [String, Number],
    default: 0
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'pills', 'minimal'].includes(value)
  },
  transition: {
    type: String,
    default: 'fade',
    validator: (value) => ['fade', 'slide', 'none'].includes(value)
  },
  useSlots: {
    type: Boolean,
    default: true
  }
})

// Events
const emit = defineEmits(['update:modelValue', 'tab-change'])

// Estado
const activeIndex = ref(0)

// Computed
const activeTab = computed(() => props.tabs[activeIndex.value] || {})

const activeTabKey = computed(() => {
  if (props.modelValue !== null) {
    // Buscar por key o index
    const foundIndex = props.tabs.findIndex((tab, index) => 
      tab.key === props.modelValue || index === props.modelValue
    )
    return foundIndex !== -1 ? foundIndex : 0
  }
  return activeIndex.value
})

const transitionName = computed(() => {
  const transitions = {
    'fade': 'tab-fade',
    'slide': 'tab-slide',
    'none': ''
  }
  return transitions[props.transition]
})

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue !== null) {
    const foundIndex = props.tabs.findIndex((tab, index) => 
      tab.key === newValue || index === newValue
    )
    if (foundIndex !== -1) {
      activeIndex.value = foundIndex
    }
  }
})

// Métodos
const getTabClass = (tab, index) => {
  const baseClass = 'tab-button'
  const variantClasses = {
    'default': index === activeIndex.value ? 'tab-button-active' : 'tab-button-inactive',
    'pills': index === activeIndex.value ? 'tab-pill-active' : 'tab-pill-inactive',
    'minimal': index === activeIndex.value ? 'tab-minimal-active' : 'tab-minimal-inactive'
  }
  
  const classes = [baseClass, variantClasses[props.variant]]
  
  if (tab.disabled) {
    classes.push('tab-disabled')
  }
  
  return classes.join(' ')
}

const selectTab = (tab, index) => {
  if (tab.disabled) return
  
  activeIndex.value = index
  
  // Emitir eventos
  const tabKey = tab.key || index
  emit('update:modelValue', tabKey)
  emit('tab-change', { tab, index, key: tabKey })
}

// Lifecycle
onMounted(() => {
  // Establecer tab inicial
  if (props.modelValue !== null) {
    const foundIndex = props.tabs.findIndex((tab, index) => 
      tab.key === props.modelValue || index === props.modelValue
    )
    if (foundIndex !== -1) {
      activeIndex.value = foundIndex
    }
  } else if (props.defaultTab !== null) {
    const foundIndex = props.tabs.findIndex((tab, index) => 
      tab.key === props.defaultTab || index === props.defaultTab
    )
    if (foundIndex !== -1) {
      activeIndex.value = foundIndex
    }
  }
})
</script>

<style>
@import './ui.css';
</style>