from utils import utils


def test_hash_and_verify_password():
    password = "s3cret-password"
    hashed = utils.hash(password)

    assert hashed != password
    assert utils.verify(password, hashed)
    assert not utils.verify("wrong", hashed)
