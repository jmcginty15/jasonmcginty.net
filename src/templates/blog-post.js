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
import React from 'react';
import Layout from '../components/layout';
import TagList from '../components/tag-list';
import { blogMenuLinks } from '../components/_config/menu-links';
import { StyledH1 } from '../components/_shared/styled-headings';
import { StyledSection } from '../components/_shared/styled-section';
import config from '../../gatsby-config';
import '../styles/blog-post.css';

const StyledBlogSection = styled(StyledSection)`
  min-height: calc(100vh - var(--header-height));

  & > .gatsby-image-wrapper {
    width: 100%;
  }
`;
const StyledBlogTitle = styled(StyledH1)`
  margin-top: 3rem;
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

const BlogPost = ({ data }) => {
  const readingTime = data.markdownRemark.fields.readingTime.text;
  const post = data.markdownRemark;
  const coverImage = post.frontmatter.cover_image ? post.frontmatter.cover_image.childImageSharp.fluid : null;
  const { tags = [], title, date } = post.frontmatter;
  const url = config.siteMetadata.url;

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
