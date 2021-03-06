import Button from '@material-ui/core/Button/Button';
import React, { useEffect } from 'react';
import {
  withStyles,
  Theme,
  createStyles,
  makeStyles,
  useTheme,
} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import StudentDropdownMenu from '../Common/StudentDropdownMenu';
import { useMergeRequest } from '../../api/mergeRequests';
import { useParams, useHistory } from 'react-router-dom';
import {
  usePostRepositoryMembers,
  useRepositoryMembers,
} from '../../api/repo_members';
import Box from '@material-ui/core/Box';

const useBigTableStyles = makeStyles({
  table: {
    minWidth: 700,
  },
});

const useTablePaginationStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexShrink: 0,
      marginLeft: theme.spacing(2.5),
    },
  }),
);

const TableCellInstance = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: '#1b3843',
      color: theme.palette.common.white,
      fontWeight: 600,
      fontSize: 16,
    },
    body: {
      fontSize: 14,
    },
  }),
)(TableCell);

interface TablePaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

const TablePaginationActions: React.FC<TablePaginationProps> = (
  TablePaginationProps,
) => {
  const classes = useTablePaginationStyles();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = TablePaginationProps;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label='first page'
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label='previous page'
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='next page'
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='last page'
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
};

const MergeRequestsTable = () => {
  const classes = useBigTableStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [studentName, setStudentName] = React.useState('All students');
  const { id } = useParams<{ id: string }>();
  const { data: rows } = useMergeRequest(id);
  const [results, setResults] = React.useState(rows?.results);
  const { data: repoMembers } = useRepositoryMembers(id);
  const { mutate } = usePostRepositoryMembers(id);
  const history = useHistory();
  useEffect(() => {
    mutate(null);
    if (studentName != 'All students') {
      setResults(rows?.results.filter((row) => row.author.name == studentName));
    } else {
      setResults(rows?.results);
    }
  }, [repoMembers, rows, studentName]);

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, results?.length - page * rowsPerPage);

  const handleShowCommits = (id: string) => {
    history.push(`/commits?merge_request=${id}`);
  };

  const handleShowDiff = (id: string) => {
    history.push(`/diff?merge_request=${id}`);
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <div style={{ float: 'right' }}>
        <StudentDropdownMenu
          repoMembers={repoMembers}
          studentName={studentName}
          setStudentName={setStudentName}
        />
      </div>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label='merge requests table'>
          <TableHead>
            <TableRow>
              <TableCellInstance>Date</TableCellInstance>
              <TableCellInstance>Title</TableCellInstance>
              <TableCellInstance>Created&nbsp;by</TableCellInstance>
              <TableCellInstance>Score</TableCellInstance>
              <TableCellInstance>Actions</TableCellInstance>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? results?.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage,
                )
              : results
            )?.map((row) => (
              <TableRow hover={true} key={row.id}>
                <TableCellInstance>
                  {row.created_at
                    .toString()
                    .slice(0, row.created_at.toString().indexOf('T'))}
                </TableCellInstance>
                <TableCellInstance style={{ fontWeight: 600 }}>
                  {row.title}
                </TableCellInstance>
                <TableCellInstance>{row.author.name}</TableCellInstance>
                {
                  // TODO: Add score below instead of upvotes
                }
                <TableCellInstance>{row.upvotes}</TableCellInstance>
                <TableCellInstance>
                  <Box display='inline' mr={2}>
                    <Button
                      variant='contained'
                      onClick={() => handleShowCommits(row.meta.id)}
                    >
                      Commits
                    </Button>
                  </Box>
                  <Button
                    variant='contained'
                    onClick={() => handleShowDiff(row.meta.id)}
                  >
                    View Diff
                  </Button>
                </TableCellInstance>
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 15, 25, { label: 'All', value: -1 }]}
                count={results?.length || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  );
};

export default MergeRequestsTable;
