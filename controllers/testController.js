export function testController(req, res) {
  res.status(200).send({
    message: "Test Routes",
    success: true,
  });
}
