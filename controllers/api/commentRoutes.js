const router = require('express').Router();
const { Comment, Post, User } = require('../../models');
const withAuth = require('../../utils/auth');

// insert a comment for a post
router.post('/', withAuth, async (req, res) => {
  try {
    const newComment = await Comment.create({
      ...req.body
    });

    res.status(200).json(newComment);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', withAuth, async (req, res) => {
  try {
    const rowsUpdated =  await Comment.update(
      {...req.body},
      {where: {
        id: req.params.id,
        // user_id: req.session.user_id,
        },
        returning: true
      });

    res.status(200).json(rowsUpdated);
  } catch (err) {
    res.status(400).json(err);
    console.error(err)
  }
});

router.delete('/:id', withAuth, async (req, res) => {
  try {
    const commentData = await Comment.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!commentData) {
      res.status(404).json({ message: 'No comment found with this id!' });
      return;
    }

    res.status(200).json(commentData);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all comments for this user
router.get('/by-user', withAuth, async (req, res) => {
  try {
    const commentData = await Comment.findAll({
      include: [
        {
          model: Post,
          attributes: {
            exclude: ['post_id'],
          },
        },
        {
          model: User,
          attributes: {
            exclude: ['user_id'],
          },
        },
      ],
      where: {
        user_id: session.user_id,
      }
    });

    const comments = commentData.map(comment => comment.get({ plain: true }));

    res.render('comments', {
      ...comments,
      logged_in: req.session.logged_in,
    });

  } catch (err) {
    console.error(err)
    res.status(500).json(err);
  };
});

// get a comment by id
router.get('/:id', async (req, res) => {
  try {
    const commentData = await Comment.findByPk(req.params.id, {
      include: [
        {
          model: Post,
          attributes: {
            exclude: ['post_id']
          },
        },
      ],
      where: {
        comment_id: req.params.id,
      }
    })

    const comment = commentData.get({ plain: true });

    res.render('comment', {
      ...comment,
      logged_in: req.session.logged_in,
    });

  } catch (err) {
    res.status(500).json(err);
  };
});

// get all
router.get('/', async (req, res) => {
  try {
    const commentData = await Comment.findAll({
      include: [
        {
          model: Post,
          attributes: {
            exclude: ['post_id']
          },
        },
      ],
    })

    const comments = commentData.map(comment => comment.get({ plain: true }));
    console.log(comments)
    res.render('comments', {
      ...comments,
      logged_in: req.session.logged_in,
    });

  } catch (err) {
    res.status(500).json(err);
  };
});

module.exports = router;
