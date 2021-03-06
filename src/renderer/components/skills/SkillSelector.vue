<template>
  <b-form @submit="$event.preventDefault()">
    <fieldset>
      <t-input-group
        v-model="searchTerm"
        name="name"
        :maxLength="constraints.name.max"
        :label="label"
        :placeholder="placeholder"
        :description="description"
        @input="search()"
      ></t-input-group>

      <div class="t-skill-selector-matches">
        <t-skill-badge
          v-for="skillKey in skillKeys"
          :key="skillKey"
          :skillKey="skillKey"
          action="add"
          @click="selectSkill(skillKey)"
        ></t-skill-badge>
      </div>

      <div class="t-skill-selector-add">
        <t-skill-badge
          v-if="!saving && trimmedTerm"
          :skill-name="$t('skill.selector.addSkill.button') + ' ' + trimmedTerm"
          action="add"
          variant="create"
          @click="addSkill(trimmedTerm)"
        ></t-skill-badge>
      </div>
      <t-loading-animation v-if="saving" size="xs"></t-loading-animation>
    </fieldset>
  </b-form>
</template>

<script>
  import SubscriptionMixin from '../../mixins/Subscription'
  import Skill from '../../models/Skill'
  import { registerConstraints, resetValidation } from '../../util/validation.js'
  import { mapGetters } from 'vuex'
  import _ from 'lodash'
  import Promise from 'bluebird'

  export default {
    mixins: [
      SubscriptionMixin({
        'matchingSkillKeys': 'skill/subscribe'
      })
    ],

    props: {
      label: {
        type: String,
        required: false
      },
      placeholder: {
        type: String,
        required: false
      },
      description: {
        type: String,
        required: false
      },
      selectedSkillKeys: {
        type: Array,
        default: () => []
      }
    },

    data () {
      return {
        saving: false,
        searchTerm: '',
        matchingSkillKeys: [],
        runningSearch: null
      }
    },

    created () {
      registerConstraints(this, this.constraints)
    },

    computed: {
      ...mapGetters({
        constraints: 'skill/constraints',
        skill: 'skill/get'
      }),

      skillKeys () {
        return this.matchingSkillKeys.filter(key => !this.selectedSkillKeys.includes(key))
      },

      trimmedTerm () {
        return this.searchTerm.trim()
      }
    },
    methods: {
      reset () {
        this.cancelSearch()
        this.searchTerm = ''
        this.matchingSkillKeys = []
        resetValidation(this)
      },

      cancelSearch () {
        if (this.runningSearch && this.runningSearch.isPending()) {
          this.runningSearch.cancel()
        }
        this.runningSearch = null
      },

      search () {
        this.cancelSearch()
        const searchTerm = this.trimmedTerm
        if (_.isEmpty(searchTerm)) {
          return
        }

        const promise = this.$store.dispatch('skill/search', searchTerm)
        this.runningSearch = promise
          .then((skillKeys) => {
            this.matchingSkillKeys = skillKeys
            return null
          })
          .catch((err) => {
            if (err) {
              console.error(err)
            }
          })
          .finally(() => {
            if (promise.isCancelled()) {
              this.runningSearch = null
            }
          })
      },

      addSkill (name) {
        this.saving = true
        let data = {
          name
        }
        Promise.resolve(this.$validator.validateAll(data)).then(valid => {
          if (!valid) {
            return null
          }

          let skill = new Skill(data)

          return this.$store.dispatch(
            'skill/create',
            skill
          )
        }).then((skillKey) => {
          if (skillKey) {
            this.selectSkill(skillKey)
          }
          return null
        }).catch((err) => {
          if (err) {
            console.error(err)
          }
        }).finally(() => {
          this.saving = false
        })
      },

      selectSkill (key) {
        this.reset()
        this.$emit('select', key)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../variables";

  .t-skill-selector-add,
  .t-skill-selector-matches {
    margin: {
      left: $skill-selector-offset-x;
      right: $skill-selector-offset-x;
    }
  }
  .t-skill-selector-matches {
    margin-bottom: $skill-selector-matches-margin-bottom;
  }
</style>
