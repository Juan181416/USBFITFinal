const myModal = new bootstrap.Modal(document.getElementById('myModal'), options)
// or
const myModalAlternative = new bootstrap.Modal('#myModal', options)



myModal.addEventListener('shown.bs.modal', () => {
  myInput.focus()
})