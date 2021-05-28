import React from "react";
import Navbar from "../../components/Navbar";
import Button from "@material-ui/core/Button";
import { useRole } from "../../context/RoleDataContext";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import TablePagination from "@material-ui/core/TablePagination";
import { useStyles } from "../../components/Styles";
import ProductModal from "../../components/Modal";
import clsx from "clsx";

export default function ShipManufacture(props) {
  const accounts = props.accounts;
  const supplyChainContract = props.supplyChainContract;
  const { roles } = useRole();
  const classes = useStyles();
  const [count, setCount] = React.useState(0);
  const [allSoldProducts, setAllSoldProducts] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const cnt = await supplyChainContract.methods.fetchProductCount().call();
      setCount(cnt);
      console.log(count);
    })();

    (async () => {
      const arr = [];
      for (var i = 1; i < count; i++) {
        const prodState = await supplyChainContract.methods
          .fetchProductState(i)
          .call();

        if (prodState === "1") {
          const prodData = [];
          const a = await supplyChainContract.methods
            .fetchProductPart1(i, "product", 0)
            .call();
          const b = await supplyChainContract.methods
            .fetchProductPart2(i, "product", 0)
            .call();
          const c = await supplyChainContract.methods
            .fetchProductPart2(i, "product", 0)
            .call();
          prodData.push(a);
          prodData.push(b);
          prodData.push(c);
          arr.push(prodData);
        }
      }
      setAllSoldProducts(arr);
    })();
  }, [count]);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const [open, setOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState([]);

  const handleClose = () => setOpen(false);

  const handleClick = async (prod) => {
    await setModalData(prod);
    console.log(modalData);
    setOpen(true);
  };

  const handleShipButton = async (id) => {
    await supplyChainContract.methods
      .shipToThirdParty(id)
      .send({ from: roles.manufacturer, gas: 1000000 })
      .then(console.log);
    setCount(0);
  };

  return (
    <div classname={classes.pageWrap}>
      <Navbar>
        <ProductModal prod={modalData} open={open} handleClose={handleClose} />
        <h1 className={classes.pageHeading}>All Products To be Shipped</h1>
        <h3 className={classes.tableCount}>Total : {allSoldProducts.length}</h3>

        <div>
          <Paper className={classes.TableRoot}>
            <TableContainer className={classes.TableContainer}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.TableHead} align="left">
                      Universal ID
                    </TableCell>
                    <TableCell className={classes.TableHead} align="center">
                      Product Code
                    </TableCell>
                    <TableCell className={classes.TableHead} align="center">
                      Manufacturer
                    </TableCell>
                    <TableCell className={classes.TableHead} align="center">
                      Manufacture Date
                    </TableCell>
                    <TableCell className={classes.TableHead} align="center">
                      Product Name
                    </TableCell>
                    <TableCell
                      className={clsx(classes.TableHead, classes.AddressCell)}
                      align="center"
                    >
                      Owner
                    </TableCell>
                    <TableCell
                      className={clsx(classes.TableHead)}
                      align="center"
                    >
                      Ship
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allSoldProducts.length !== 0 ? (
                    allSoldProducts
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((prod) => {
                        return (
                            <>
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={prod[0][0]}
                            
                          >
                            <TableCell
                              className={classes.TableCell}
                              component="th"
                              align="left"
                              scope="row"
                              onClick={() => handleClick(prod)}
                            >
                              {prod[0][0]}
                            </TableCell>
                            <TableCell
                              className={classes.TableCell}
                              align="center"
                              onClick={() => handleClick(prod)}
                            >
                              {prod[1][2]}
                            </TableCell>
                            <TableCell
                              className={classes.TableCell}
                              align="center"
                              onClick={() => handleClick(prod)}
                            >
                              {prod[0][4]}
                            </TableCell>
                            <TableCell align="center" onClick={() => handleClick(prod)}>{prod[1][0]}</TableCell>
                            <TableCell
                              className={classes.TableCell}
                              align="center"
                              onClick={() => handleClick(prod)}
                            >
                              {prod[1][1]}
                            </TableCell>
                            <TableCell
                              className={clsx(
                                classes.TableCell,
                                classes.AddressCell
                              )}
                              align="center"
                              onClick={() => handleClick(prod)}
                            >
                              {prod[0][2]}
                            </TableCell>
                            <TableCell
                           className={clsx(classes.TableCell)}
                           align="center"
                         >
                           <Button
                             type="submit"
                             variant="contained"
                             color="primary"
                             onClick={() => handleShipButton(prod[0][0])}
                           >
                             SHIP
                           </Button>
                         </TableCell>
                          </TableRow>
                           
                         </>
                        );
                      })
                  ) : (
                    <> </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={allSoldProducts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Paper>
        </div>

        {/* {allSoldProducts.length !== 0 ? (
          allSoldProducts.map((prod) => (
            <>
              <div>
                <p>Universal ID : {prod[0][0]}</p>
                <p>SKU : {prod[0][1]}</p>
                <p>Owner : {prod[0][2]}</p>
                <p>Manufacturer : {prod[0][3]}</p>
                <p>Name of Manufacturer : {prod[0][4]}</p>
                <p>Details of Manufacturer : {prod[0][5]}</p>
                <p>Longitude of Manufature : {prod[0][6]}</p>
                <p>Latitude of Manufature : {prod[0][7]}</p>

                <p>Manufactured date : {prod[1][0]}</p>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={() => handleShipButton(prod[0][0])}
                >
                  SHIP
                </Button>
              </div>
            </>
          ))
        ) : (
          <> </>
        )} */}
      </Navbar>
    </div>
  );
}