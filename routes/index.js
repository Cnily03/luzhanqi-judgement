const Router = require("koa-router");
const router = new Router();
const root = "/";

router.get(root, async (ctx, next) => {
    await ctx.render("index", {
        title: "陆战棋第三方裁判"
    });
})

module.exports = router;