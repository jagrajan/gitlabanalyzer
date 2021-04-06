import { Commit, RepositoryMember } from '@ceres/types';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useRepositoryAuthors } from '../../api/author';
import { ApiResource } from '../../api/base';
import { useRepositoryMembers } from '../../api/repo_members';
import DefaultPageLayout from '../../components/DefaultPageLayout';
import Author from './components/Author';
import DefaultPageTitleFormat from '../../components/DefaultPageTitleFormat';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import Grid from '@material-ui/core/Grid';

function findSelectedMember(
  author: ApiResource<Commit.Author>,
  members: ApiResource<RepositoryMember>[],
) {
  return members.find(
    (member) => member.meta.id === author.repository_member_id,
  );
}

// Sort level 1: Authors without an associated repository member come first
// Sort level 2: Sort by author name
function compareCommitAuthors(a: Commit.Author, b: Commit.Author) {
  if (a.repository_member_id && !b.repository_member_id) {
    return 1;
  } else if (!a.repository_member_id && b.repository_member_id) {
    return -1;
  }
  return a.author_name.localeCompare(b.author_name);
}

const Members: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: members } = useRepositoryMembers(id);
  const { data: authors } = useRepositoryAuthors(id);
  const { push } = useHistory();

  return (
    <DefaultPageLayout>
      <Container>
        <Grid container alignItems='center' justify='space-between'>
          <Grid item>
            <DefaultPageTitleFormat>Members</DefaultPageTitleFormat>
          </Grid>
          <Grid item>
            <IconButton onClick={() => push(`/setup/${id}`)}>
              <CancelIcon fontSize='large' />
            </IconButton>
          </Grid>
        </Grid>
        <Container maxWidth='sm'>
          <Box>
            {members &&
              authors?.sort(compareCommitAuthors)?.map((author) => {
                const member = findSelectedMember(author, members);
                return (
                  <Author
                    key={author.meta.id}
                    author={author}
                    member={member}
                    allMembers={members}
                  />
                );
              })}
          </Box>
        </Container>
      </Container>
    </DefaultPageLayout>
  );
};

export default Members;
