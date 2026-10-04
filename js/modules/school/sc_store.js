/* ============================================================
 * sc_store.js —— 「藏经阁（school）」状态层（Vuex 替身）
 *
 * 数值照抄 gooboo store/school.js：state/getters/mutations/actions。
 * 适配：Vue.set → VUESET；`store` → `SCTORE`；学科/书籍数据结构与核心对齐。
 * 桥接：书籍 effect 经 SCTORE.dispatch('system/applyEffect') 由 SC_SYSTEM
 *       同时写入本模块 SC_MULT 与目标玩法模块 MULT。
 * ============================================================ */
function VUESET(obj, key, val) { obj[key] = val; return obj; }

/* 当前 subfeature 解析（书籍按 subfeature 激活；未移植/未知 → 按 subfeature0） */
function scCurrentSubfeature(feature) {
  const p = (getter, fallback) => { try { const v = getter(); return (v === undefined || v === null) ? fallback : v; } catch (e) { return fallback; } };
  if (feature === 'village' && typeof VI_RT !== 'undefined') return p(() => VI_RT.state.system.features.village.currentSubfeature, 0);
  if (feature === 'horde' && typeof HO_RT !== 'undefined') return p(() => HO_RT.state.system.features.horde.currentSubfeature, 0);
  if (feature === 'farm' && typeof FA_RT !== 'undefined') return p(() => FA_RT.state.system.features.farm.currentSubfeature, 0);
  // mining / gallery：可读取时取之，否则 subfeature0
  return 0;
}

const SC_STORE = {
  namespaced: true,
  state: {
    subject: {},
    book: {},
    totalPointRequirement: [1000, 2500, 5000, 10000, 20000, 30000, 40000, 70000, 100000, 150000, 200000, 250000],
    emeraldRequirement: [10, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500],
    crownRequirement: [
      { amount: 100000, color: null, size: 14 },
      { amount: 250000, color: 'cherry', size: 18 },
      { amount: 500000, color: 'light-grey', size: 22 },
      { amount: 1000000, color: 'amber', size: 26 },
      { amount: 2500000, color: 'red', size: 30 },
      { amount: 5000000, color: 'cyan', size: 34 },
      { amount: 10000000, color: 'deep-purple', size: 38 }
    ],
    bonusDust: 0,
    multipass: 1
  },
  getters: {
    subjectsBookGain: (state, getters, rootState) => {
      let amount = 0;
      for (const key in state.subject) {
        const elem = state.subject[key];
        if (elem.unlock === null || (rootState.unlock[elem.unlock] && rootState.unlock[elem.unlock].see)) amount++;
      }
      return amount * SCHOOL_BOOK_BASE_GAIN;
    },
    dustMult: (state, getters, rootState) => {
      const gl = (rootState.meta && rootState.meta.globalLevel) || 0;
      return Math.min(1, (gl + 25) / 200);
    },
    examReward: (state, getters) => (score, grade) => {
      let dustBase = SCHOOL_EXAM_DUST_MIN + SCHOOL_EXAM_DUST_MIN * 0.5 * ((grade - 1) * 0.35 + score) * Math.min(score * 2, 1);
      if (dustBase > 1000) dustBase = Math.pow((dustBase - 900) / 100, 0.8) * 100 + 900;
      if (dustBase > 2000) dustBase = Math.pow((dustBase - 1900) / 100, 0.2) * 100 + 1900;
      return Math.round(dustBase * getters.dustMult);
    },
    pointReward: () => (score, grade) => {
      return Math.round(100 * (grade * 0.1 + 1) * (grade * 0.25 + (score > 1 ? Math.sqrt(score) : score)) * Math.min(score * 2, 1));
    },
    booksLeft: (state, getters, rootState, rootGetters) => {
      let books = rootGetters['mult/get']('schoolBook');
      for (const key in state.book) {
        if (state.book[key].owned) books--;
      }
      return books;
    }
  },
  mutations: {
    initSubject(state, o) {
      VUESET(state.subject, o.name, {
        unlock: o.unlock ?? null,
        grade: 0,
        currentGrade: 0,
        progress: 0,
        scoreGoal: o.scoreGoal ?? 10,
        pointsTotal: 0,
        booksSkipped: 0
      });
    },
    initBook(state, o) {
      VUESET(state.book, o.feature + '_' + o.name, {
        feature: o.feature,
        subfeature: o.subfeature,
        scalesWithGL: o.scalesWithGL ?? false,
        minGL: o.minGL ?? 0,
        maxGL: o.maxGL ?? null,
        owned: false,
        alwaysActive: o.alwaysActive ?? false,
        raiseOtherCap: o.raiseOtherCap ?? null,
        effect: o.effect ?? []
      });
    },
    updateKey(state, o) { VUESET(state, o.key, o.value); },
    updateSubjectKey(state, o) { VUESET(state.subject[o.name], o.key, o.value); },
    updateBookKey(state, o) { VUESET(state.book[o.name], o.key, o.value); }
  },
  actions: {
    cleanState({ state, commit }) {
      for (const key in state.subject) {
        commit('updateSubjectKey', { name: key, key: 'grade', value: 0 });
        commit('updateSubjectKey', { name: key, key: 'currentGrade', value: 0 });
        commit('updateSubjectKey', { name: key, key: 'progress', value: 0 });
        commit('updateSubjectKey', { name: key, key: 'pointsTotal', value: 0 });
        commit('updateSubjectKey', { name: key, key: 'booksSkipped', value: 0 });
      }
      for (const key in state.book) commit('updateBookKey', { name: key, key: 'owned', value: false });
      commit('updateKey', { key: 'bonusDust', value: 0 });
      commit('updateKey', { key: 'multipass', value: 1 });
    },
    convertPass({ getters, rootGetters, dispatch }) {
      if (rootGetters['currency/value']('school_examPass') >= 1) {
        dispatch('currency/gain', { feature: 'school', name: 'goldenDust', amount: Math.round(SCHOOL_EXAM_DUST_MIN * getters.dustMult) }, { root: true });
        dispatch('currency/spend', { feature: 'school', name: 'examPass', amount: 1 }, { root: true });
      }
    },
    readBook({ state, getters, commit, dispatch }, name) {
      if (!state.book[name].owned && getters.booksLeft > 0) {
        commit('updateBookKey', { name, key: 'owned', value: true });
        dispatch('applyBookEffect', name);
      }
    },
    applyBookEffect({ state, dispatch }, name) {
      const book = state.book[name];
      const globalLevel = ((SC_RT.state.meta && SC_RT.state.meta.globalLevelParts) || {})[book.feature + '_' + book.subfeature] ?? 0;
      const sf = scCurrentSubfeature(book.feature);
      const active = book.owned && (book.alwaysActive || sf === book.subfeature);
      if (book.owned && active) {
        const lvl = book.scalesWithGL ? Math.max((Math.min(globalLevel, book.maxGL ?? Infinity) + 1 - book.minGL), 0) : (globalLevel >= book.minGL ? 1 : 0);
        book.effect.forEach(elem => {
          dispatch('system/applyEffect', {
            type: elem.type,
            name: elem.name,
            multKey: 'schoolBook_' + name,
            value: (typeof elem.value === 'function' ? elem.value(lvl) : elem.value)
          }, { root: true });
        });
      } else if (book.owned) {
        book.effect.forEach(elem => {
          dispatch('system/resetEffect', {
            type: elem.type,
            name: elem.name,
            multKey: 'schoolBook_' + name
          }, { root: true });
        });
      }
    },
    updateBookEffects({ state, dispatch }, feature) {
      for (const key in state.book) {
        const elem = state.book[key];
        if (elem.owned && (feature === null || feature === undefined || elem.feature === feature)) {
          dispatch('applyBookEffect', key);
        }
      }
    },
    finishSchool({ state, rootState, getters, commit, dispatch }, o) {
      const subject = state.subject[o.subject];
      const reachedBefore = Math.max(subject.grade, state.totalPointRequirement.filter(el => subject.pointsTotal >= el).length);
      const score = (o.mode === 'exam' ? 1 : 2) * o.score / subject.scoreGoal;
      const pointGain = getters.pointReward(score, subject.currentGrade) * (o.mode === 'exam' ? (2.5 + state.multipass * 7.5) : 1);
      if (pointGain > 0) {
        commit('updateSubjectKey', { name: o.subject, key: 'pointsTotal', value: subject.pointsTotal + pointGain });
        commit('stat/add', { feature: 'school', name: 'totalPoints', value: pointGain }, { root: true });
      }

      let gradeGain = 0;
      let gradePlus = false;
      let dustGain = 0;
      let bonusDustGain = 0;

      if (o.mode === 'study' && subject.currentGrade >= subject.grade) {
        let newProgress;
        if (o.subject === 'math') {
          // 数学：每 5 题 = 1 progress（简化直算）
          newProgress = Math.max(o.score * 0.2 + subject.progress, 0);
        } else {
          // 其他学科：保持原归一化逻辑
          newProgress = Math.max((score - (subject.currentGrade <= 0 ? 0 : 1)) * 0.2 + subject.progress, 0);
        }
        if (newProgress >= 1) {
          gradePlus = true;
          const newGrade = subject.grade + 1;
          commit('stat/increaseTo', { feature: 'school', name: 'highestGrade', value: newGrade }, { root: true });
          commit('updateSubjectKey', { name: o.subject, key: 'grade', value: newGrade });
          commit('updateSubjectKey', { name: o.subject, key: 'currentGrade', value: newGrade });
          commit('updateSubjectKey', { name: o.subject, key: 'progress', value: 0 });
        } else {
          gradeGain = newProgress - subject.progress;
          commit('updateSubjectKey', { name: o.subject, key: 'progress', value: newProgress });
        }
      }
      if (o.mode === 'exam') {
        const baseDustGain = getters.examReward(score, subject.currentGrade);
        dustGain += baseDustGain;
        if (state.multipass > 1) {
          commit('updateKey', { key: 'bonusDust', value: state.bonusDust + dustGain * (state.multipass - 1) });
          bonusDustGain += dustGain * (state.multipass - 1);
        }
        const overcap = dustGain + rootState.currency.school_goldenDust.value - rootState.currency.school_goldenDust.cap;
        if (overcap > 0) {
          bonusDustGain += overcap;
          dustGain -= overcap;
        }
        dispatch('currency/gain', { feature: 'school', name: 'goldenDust', amount: baseDustGain }, { root: true });
        dispatch('note/find', 'school_1', { root: true });

        if (o.score >= subject.scoreGoal && subject.currentGrade >= subject.grade) {
          gradePlus = true;
          const newGrade = subject.grade + 1;
          commit('stat/increaseTo', { feature: 'school', name: 'highestGrade', value: newGrade }, { root: true });
          commit('updateSubjectKey', { name: o.subject, key: 'grade', value: newGrade });
          commit('updateSubjectKey', { name: o.subject, key: 'currentGrade', value: newGrade });
          commit('updateSubjectKey', { name: o.subject, key: 'progress', value: 0 });
        }
      }

      commit('system/addNotification', { color: 'success', timeout: 5000, message: {
        type: 'school', isExam: o.mode === 'exam', score: o.score,
        perfectScore: o.mode === 'exam' && gradePlus, points: pointGain,
        grade: gradeGain, gradePlus, dust: dustGain, bonusDust: bonusDustGain
      } }, { root: true });

      const reachedAfter = Math.max(subject.grade, state.totalPointRequirement.filter(el => subject.pointsTotal >= el).length);
      if (reachedAfter > reachedBefore && subject.booksSkipped > 0) {
        const refundStats = state.emeraldRequirement.filter((el, index) => {
          const reached = index + 1;
          return reached > reachedBefore && reached <= reachedAfter;
        });
        commit('updateSubjectKey', { name: o.subject, key: 'booksSkipped', value: Math.max(subject.booksSkipped - refundStats.length, 0) });
        commit('currency/add', { feature: 'gem', name: 'emerald', amount: refundStats.reduce((a, b) => a + b, 0) }, { root: true });
      }

      dispatch('applySubjectBooks', o.subject);
    },
    applySubjectBooks({ state, dispatch }, name) {
      const subject = state.subject[name];
      const reached = Math.max(subject.grade, state.totalPointRequirement.filter(el => subject.pointsTotal >= el).length) + subject.booksSkipped;
      if (reached > 0) {
        dispatch('mult/setBase', { name: 'schoolBook', key: 'schoolSubject_' + name, value: reached }, { root: true });
      } else {
        dispatch('mult/removeKey', { name: 'schoolBook', type: 'base', key: 'schoolSubject_' + name }, { root: true });
      }
    },
    skipBook({ state, rootGetters, commit, dispatch }, name) {
      const subject = state.subject[name];
      const reached = Math.max(subject.grade, state.totalPointRequirement.filter(el => subject.pointsTotal >= el).length) + subject.booksSkipped;
      if (reached < state.emeraldRequirement.length) {
        const price = state.emeraldRequirement[reached];
        if (rootGetters['currency/canAfford']({ gem_emerald: price })) {
          commit('updateSubjectKey', { name, key: 'booksSkipped', value: subject.booksSkipped + 1 });
          dispatch('currency/spend', { feature: 'gem', name: 'emerald', amount: price }, { root: true });
          dispatch('applySubjectBooks', name);
        }
      }
    }
  }
};
if (typeof module !== "undefined") module.exports = { SC_STORE, scCurrentSubfeature, VUESET };