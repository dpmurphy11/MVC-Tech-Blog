const router = require('express').Router();
const { Post, User, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

router.post('/', withAuth, async (req, res) => {
  try {
    const newPost = await Post.create({
      ...req.body,
      user_id: req.session.user_id,
    });

    res.status(200).json(newPost);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', withAuth, async (req, res) => {
  try {
    const rowsUpdated =  await Post.update(
      {...req.body},
      {where: {
        id: req.params.id,
        user_id: req.session.user_id,
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
    const postData = await Post.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!postData) {
      res.status(404).json({ message: 'No post found with this id!' });
      return;
    }

    res.status(200).json(postData);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all the posts for this user
router.get('/by-user', withAuth, async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [
        {
          model: Comment,
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

    const posts = postData.map(post => post.get({ plain: true }));
    // const posts = postData.get({ plain: true });
console.log(posts)
    res.render('posts', {
      ...posts,
      logged_in: req.session.logged_in,
    });

  } catch (err) {
    res.status(500).json(err);
    console.error(err)
  };
});

// get all posts
router.get('/', async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [
        {
          model: Comment,
          attributes: {
            exclude: ['post_id'],
          },
        },
      ],
    });
    const posts = postData.map(post => post.get({ plain: true }));

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  };
});

// get a post by id
router.get('/:id', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [
        {
          model: Comment,
          attributes: {
            exclude: ['post_id']
          },
        },
      ],
      where: {
        id: req.params.id,
      }
    })

    const post = postData.get({ plain: true });

    res.render('post', {
      ...post,
      logged_in: req.session.logged_in,
    });

  } catch (err) {
    res.status(500).json(err);
  };
});

module.exports = router;
