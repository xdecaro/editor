(() => {
  'use strict';

  const initializedRoots = new WeakSet();
  const boundForms = new WeakSet();
  const FIELD_SELECTOR = '[data-xde-field-editor]';

  const ensureJoomlaBridge = () => {
    window.Joomla = window.Joomla || {};
    Joomla.editors = Joomla.editors || {instances: {}};
    Joomla.editors.instances = Joomla.editors.instances || {};
    Joomla.XdecaroEditor = Joomla.XdecaroEditor || {};
  };

  const bindForm = (form) => {
    if (!form || boundForms.has(form)) return;

    boundForms.add(form);
    form.addEventListener('submit', () => {
      form.querySelectorAll(FIELD_SELECTOR).forEach((fieldRoot) => {
        const source = fieldRoot.querySelector('textarea[id]');
        if (!source) return;
        Joomla.editors?.instances?.[source.id]?.onSave?.();
      });
    });
  };

  const register = (fieldRoot) => {
    if (!(fieldRoot instanceof Element) || initializedRoots.has(fieldRoot)) return false;

    const source = fieldRoot.querySelector('textarea[id]');
    const editorRoot = fieldRoot.querySelector('[data-xde-editor]');
    const canvas = editorRoot?.querySelector('[data-xde-canvas]');

    if (!source || !editorRoot || !canvas) return false;

    ensureJoomlaBridge();
    initializedRoots.add(fieldRoot);
    fieldRoot.setAttribute('data-xde-editor-initialized', 'true');

    canvas.innerHTML = source.value || '<p><br></p>';
    canvas.dispatchEvent(new Event('input', {bubbles: true}));

    const sync = () => {
      source.value = canvas.innerHTML;
      source.dispatchEvent(new Event('change', {bubbles: true}));
    };

    canvas.addEventListener('input', sync);
    editorRoot.addEventListener('click', () => window.setTimeout(sync, 0));

    const insertHtml = (html) => {
      canvas.focus();
      document.execCommand('insertHTML', false, String(html ?? ''));
      sync();
    };

    Joomla.editors.instances[source.id] = {
      getValue: () => {
        sync();
        return source.value;
      },
      setValue: (html) => {
        canvas.innerHTML = String(html ?? '');
        sync();
      },
      replaceSelection: insertHtml,
      disable: () => {
        canvas.setAttribute('contenteditable', 'false');
        editorRoot.classList.add('is-disabled');
      },
      enable: () => {
        canvas.setAttribute('contenteditable', 'true');
        editorRoot.classList.remove('is-disabled');
      },
      onSave: sync,
      getSelection: () => window.getSelection()?.toString() || ''
    };

    bindForm(source.closest('form'));
    return true;
  };

  const scan = (root = document) => {
    ensureJoomlaBridge();

    const roots = [];
    if (root instanceof Element && root.matches(FIELD_SELECTOR)) roots.push(root);
    if (root && typeof root.querySelectorAll === 'function') {
      root.querySelectorAll(FIELD_SELECTOR).forEach((fieldRoot) => roots.push(fieldRoot));
    }

    return roots.reduce((count, fieldRoot) => count + (register(fieldRoot) ? 1 : 0), 0);
  };

  ensureJoomlaBridge();
  Joomla.XdecaroEditor.scan = scan;

  const boot = () => scan(document);

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot, {once: true})
    : boot();
})();
