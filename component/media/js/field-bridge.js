(() => {
  'use strict';

  const register = (fieldRoot) => {
    const source = fieldRoot.querySelector('textarea');
    const editorRoot = fieldRoot.querySelector('[data-xde-editor]');
    const canvas = editorRoot?.querySelector('[data-xde-canvas]');

    if (!source || !editorRoot || !canvas) return;

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

    window.Joomla = window.Joomla || {};
    Joomla.editors = Joomla.editors || {instances: {}};
    Joomla.editors.instances = Joomla.editors.instances || {};

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

    const form = source.closest('form');
    form?.addEventListener('submit', sync);
  };

  const boot = () => document.querySelectorAll('[data-xde-field-editor]').forEach(register);

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot, {once: true})
    : boot();
})();
