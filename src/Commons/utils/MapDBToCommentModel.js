module.exports = (
  {

    id,
    content,
    date,
    username,
    is_deleted,
  },
) => ({
  id,
  content,
  date,
  username,
  isDeleted: is_deleted,
});
