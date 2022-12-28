import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  RedditShareButton,
  TumblrShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  WhatsappIcon,
  LinkedinIcon,
  RedditIcon,
  TumblrIcon,
  EmailIcon
} from 'react-share';
import styled from '@emotion/styled';
import { graphql } from 'gatsby';
import Img from 'gatsby-image';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';
import TagList from '../components/tag-list';
import { blogMenuLinks } from '../components/_config/menu-links';
import { StyledH1, StyledH2 } from '../components/_shared/styled-headings';
import { StyledSection } from '../components/_shared/styled-section';
import config from '../../gatsby-config';
import axios from 'axios';
import '../styles/blog-post.css';

const StyledBlogSection = styled(StyledSection)`
  min-height: calc(100vh - var(--header-height));

  & > .gatsby-image-wrapper {
    width: 100%;
  }
`;
const StyledCommentSection = styled(StyledSection)`
  width: 100%;
  margin-bottom: 0;
`;
const StyledBlogTitle = styled(StyledH1)`
  margin-top: 3rem;
`;
const StyledSubtitle = styled(StyledH2)`
  margin-top: 2rem;
`;
const StyledDate = styled.div`
  font-size: 0.8rem;

  & span {
    font-weight: 500;
  }
`;
const StyledBlogText = styled.div`
  padding: 2rem;
  width: 100%;
  background: var(--bg-code);
  border-radius: var(--radius);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
`;
const StyledCommentText = styled.div`
  padding: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  background: var(--bg-code);
  border-radius: var(--radius);
`;
const StyledParagraph = styled.p`
  margin-top: 1rem;
`;
const StyledForm = styled.form`
  padding: 2rem;
  width: 100%;
  background: var(--bg-code);
  border-radius: var(--radius);
`;
const StyledInput = styled.input`
  display: block;
  font-family 'Poppins', sans-serif;
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0.35rem;
  font-size: 20px;
`;
const StyledTextArea = styled.textarea`
  display: block;
  font-family 'Poppins', sans-serif;
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0.35rem;
  font-size: 20px;
`;
const StyledButton = styled.button`
  padding: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  background-color: var(--primary-color);
  color: var(--bg-color);
  font-weight: bold;
  font-family 'Poppins', sans-serif;
  font-size: 20px;
  border: outset 2px var(--bg-color);
  border-radius: var(--radius);
`;
const StyledH5 = styled.h5`
  padding: 0.5rem;
  margin-top: 0;
  margin-bottom: 0;
  color: var(--primary-color);
  font-weight: bold;
  font-family 'Poppins', sans-serif;
  font-size: 20px;
`;

const BlogPost = ({ data }) => {
  const readingTime = data.markdownRemark.fields.readingTime.text;
  const post = data.markdownRemark;
  const coverImage = post.frontmatter.cover_image ? post.frontmatter.cover_image.childImageSharp.fluid : null;
  const { tags = [], title, date } = post.frontmatter;
  const url = config.siteMetadata.url;

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    text: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    axios.get(`https://jason-mcginty-blog.herokuapp.com/comments/${post.frontmatter.filename}`)
      .then(res => setComments(res.data.comments));
  }, []);

  const handleChange = (evt) => setFormData({ ...formData, [evt.target.name]: evt.target.value });

  const handleSubmit = (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    setFormData({
      name: '',
      website: '',
      text: ''
    });

    axios.post(`https://jason-mcginty-blog.herokuapp.com/comments`, {
      post: post.frontmatter.filename,
      name: formData.name,
      website: formData.website,
      text: formData.text
    }).then(res => {
      setComments([...comments, res.data.comment]);
      setSubmitting(false);
    });
  }

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);

    let month = date.getMonth();
    switch (month) {
      case 0:
        month = 'January';
        break;
      case 1:
        month = 'February';
        break;
      case 2:
        month = 'March';
        break;
      case 3:
        month = 'April';
        break;
      case 4:
        month = 'May';
        break;
      case 5:
        month = 'June';
        break;
      case 6:
        month = 'July';
        break;
      case 7:
        month = 'August';
        break;
      case 8:
        month = 'September';
        break;
      case 9:
        month = 'October';
        break;
      case 10:
        month = 'November';
        break;
      case 11:
        month = 'December';
        break;
    }

    const day = date.getDate();
    const year = date.getFullYear();

    let hour = date.getHours();
    if (hour < 10) hour = `0${hour}`;
    let minute = date.getMinutes();
    if (minute < 10) minute = `0${minute}`;

    return `${month} ${day} ${year}, ${hour}:${minute}`;
  }

  return (
    <Layout menuLinks={blogMenuLinks}>
      <StyledBlogSection>
        <StyledBlogTitle>{title}</StyledBlogTitle>
        <StyledDate>
          Posted {date}. <span>{readingTime}.</span>
        </StyledDate>
        <TagList tags={tags} />
        {coverImage && <Img fluid={coverImage} />}
        <StyledBlogText dangerouslySetInnerHTML={{ __html: post.html }} />
        <div className="share-buttons">
          <p>Share this article:</p>
          <FacebookShareButton url={`${url}/blog/${post.frontmatter.filename}`} quote={post.frontmatter.description}>
            <FacebookIcon size={48} round={true} />
          </FacebookShareButton>
          <LinkedinShareButton url={`${url}/blog/${post.frontmatter.filename}`} title={post.frontmatter.title} description={post.frontmatter.description}>
            <LinkedinIcon size={48} round={true} />
          </LinkedinShareButton>
          <TwitterShareButton url={`${url}/blog/${post.frontmatter.filename}`} title={post.frontmatter.title}>
            <TwitterIcon size={48} round={true} />
          </TwitterShareButton>
          <TelegramShareButton url={`${url}/blog/${post.frontmatter.filename}`} title={post.frontmatter.title}>
            <TelegramIcon size={48} round={true} />
          </TelegramShareButton>
          <WhatsappShareButton url={`${url}/blog/${post.frontmatter.filename}`} title={post.frontmatter.title}>
            <WhatsappIcon size={48} round={true} />
          </WhatsappShareButton>
          <RedditShareButton url={`${url}/blog/${post.frontmatter.filename}`} title={post.frontmatter.title}>
            <RedditIcon size={48} round={true} />
          </RedditShareButton>
          <TumblrShareButton url={`${url}/blog/${post.frontmatter.filename}`} title={post.frontmatter.title} caption={post.frontmatter.description}>
            <TumblrIcon size={48} round={true} />
          </TumblrShareButton>
          <EmailShareButton url={`${url}/blog/${post.frontmatter.filename}`} subject={post.frontmatter.title}>
            <EmailIcon size={48} round={true} />
          </EmailShareButton>
        </div>
        <div className="comments" style={{ width: "100%" }}>
          <StyledBlogTitle>Comments</StyledBlogTitle>
          {comments.length ? <StyledCommentSection>
            {comments.map(comment => <StyledCommentText key={comment.id}>
              <StyledSubtitle>
                {comment.website ? (
                  <a className="commenter-link" href={comment.website} target="_blank" rel="noreferrer"><span style={{ color: "var(--primary-color)" }}>{comment.name.slice(0, 1)}</span>{comment.name.slice(1)}</a>
                ) : (
                  <span><span style={{ color: "var(--primary-color)" }}>{comment.name.slice(0, 1)}</span>{comment.name.slice(1)}</span>
                )}
              </StyledSubtitle>
              <StyledDate>Posted {formatDateTime(comment.time)}.</StyledDate>
              {comment.text.split('\n').map((paragraph, index) => <StyledParagraph key={index}>{paragraph}</StyledParagraph>)}
            </StyledCommentText>)}
          </StyledCommentSection> : <h4 id="none-label">None yet...</h4>}
          <StyledForm id="comment-form" onSubmit={handleSubmit}>
            <StyledSubtitle><span style={{ color: "var(--primary-color)" }}>L</span>eave a comment</StyledSubtitle>
            <label htmlFor="name">Display name <span style={{ color: "red" }}>*</span></label>
            <StyledInput type="text" value={formData.name} required name="name" onChange={handleChange} />
            <label htmlFor="website">Web site</label>
            <StyledInput type="text" value={formData.website} name="website" onChange={handleChange} />
            <label htmlFor="text">Comment text <span style={{ color: "red" }}>*</span></label>
            <StyledTextArea id="text-area" value={formData.text} required name="text" rows="5" wrap="hard" onChange={handleChange} />
            {submitting ? <StyledH5 style={{ color: "var(--primary-color)" }}>Submitting...</StyledH5> : <StyledButton id="submit-button" type="submit">Submit</StyledButton>}
          </StyledForm>
        </div>
      </StyledBlogSection>
    </Layout>
  );
};

BlogPost.propTypes = {
  data: PropTypes.object.isRequired,
};

export default BlogPost;

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        tags
        date(formatString: "MMMM D YYYY")
        description
        filename
        cover_image {
          childImageSharp {
            fluid(maxWidth: 800) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
      fields {
        readingTime {
          text
        }
      }
    }
  }
`;
